// File: app/api/process-leaderboard/route.ts


import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';

// Define the structure for a row in the CSV
interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
  // You can add other fields from your CSV here if needed
}

// Helper function to scrape a single profile URL
async function scrapeProfile(url: string) {
  if (!url) {
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
  }
  try {
    const response = await fetch(url, { cache: 'no-store' }); // Use no-store to get fresh data
    const html = await response.text();
    const $ = cheerio.load(html);
    const badges = $('.profile-badge');
    let skillBadgeCount = 0;
    let arcadeBadgeCount = 0;
    let triviaBadgeCount = 0;
    const arcadePatterns = [/Level \d:/i, /Basecamp/i, /Cert(ification)? Zone/i, /Special Game/i, /Arcade Game/i];
    const triviaPatterns = [/Trivia/i, /Arcade Trivia/i];
    badges.each((i, el) => {
      let badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
      if (arcadePatterns.some((pat) => pat.test(badgeTitle))) {
        arcadeBadgeCount++;
      } else if (triviaPatterns.some((pat) => pat.test(badgeTitle))) {
        triviaBadgeCount++;
      } else {
        skillBadgeCount++;
      }
    });
    return { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    // Return zero counts on failure so the process can continue
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
  }
}

// Main API endpoint to process the CSV
export async function POST(request: Request) {
  try {
    const csvText = await request.text();
    if (!csvText) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    }
    // Parse the CSV text into JSON
    const parsedCsv = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    const participants = parsedCsv.data;
    // Scrape all profiles concurrently for speed
    const processingPromises = participants.map(async (participant) => {
      const { "Nama Peserta": nama, "URL Profil Google Cloud Skills Boost": url } = participant;
      const { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount } = await scrapeProfile(url);
      // --- Point calculation logic (moved from frontend to backend) ---
      const arcadeCount = arcadeBadgeCount;
      const triviaCount = triviaBadgeCount;
      const arcadePoints = arcadeCount + triviaCount + (skillBadgeCount * 0.5);
      let milestoneName = "";
      let bonusPoints = 0;
      if (arcadeCount >= 10 && triviaCount >= 8 && skillBadgeCount >= 44) {
        milestoneName = "ULTIMATE MASTER";
        bonusPoints = 25;
      } else if (arcadeCount >= 8 && triviaCount >= 7 && skillBadgeCount >= 30) {
        milestoneName = "GALAXY COMMANDER";
        bonusPoints = 15;
      } else if (arcadeCount >= 6 && triviaCount >= 6 && skillBadgeCount >= 20) {
        milestoneName = "SPACE PILOT";
        bonusPoints = 10;
      } else if (arcadeCount >= 4 && triviaCount >= 4 && skillBadgeCount >= 10) {
        milestoneName = "CADET";
        bonusPoints = 5;
      }
      const totalPoints = arcadePoints + bonusPoints;
      return {
        nama,
        totalPoints,
        milestone: milestoneName || "-",
        skillCount: skillBadgeCount,
        arcadeCount,
        triviaCount,
        bonusPoints,
      };
    });
    // Wait for all scraping and processing to complete
    const leaderboardData = await Promise.all(processingPromises);
    // Sort the final leaderboard by total points
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error processing leaderboard:', error);
    return NextResponse.json({ error: 'Failed to process leaderboard' }, { status: 500 });
  }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  