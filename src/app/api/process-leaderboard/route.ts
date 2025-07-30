interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
  // You can add other fields from your CSV here if needed
}

// Helper function to scrape a single profile URL
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';

interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
}

async function scrapeProfile(url: string) {
  if (!url) {
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
  }
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const html = await response.text();
    const $ = cheerio.load(html);
    const badges = $('.profile-badge');
    let skillBadgeCount = 0;
    let arcadeBadgeCount = 0;
    let triviaBadgeCount = 0;
    // Regex lists (ordered by specificity)
    const triviaRegex = /Skills Boost Arcade Trivia July 2025 Week [1-4]/i;
    const arcadeRegex = /Skills Boost Arcade Base Camp July 2025|Skills Boost Arcade Certification Zone July 2025|Level 1: Core Infrastructure and Security|Level 2: Modern Application Deployment|Level 3: Advanced App Operations|Work Meets Play: Banking With Empathy/i;

    function getCategory(name: string): 'trivia' | 'arcade' | 'skill' {
      if (triviaRegex.test(name)) return 'trivia';
      if (arcadeRegex.test(name)) return 'arcade';
      return 'skill';
    }
    badges.each((i, el) => {
      let badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
      if (!badgeTitle) {
        badgeTitle = $(el).text().trim();
      }
      // Check in order of specificity
      const category = getCategory(badgeTitle);
      if (category === 'trivia') {
        triviaBadgeCount++;
      } else if (category === 'arcade') {
        arcadeBadgeCount++;
      } else {
        skillBadgeCount++;
        // Log unknown badge titles for review
        if (badgeTitle) {
          console.log('Unknown badge title (counted as skill):', badgeTitle);
        } else {
          console.log('Unknown badge element (no title):', $(el).html());
        }
      }
    });
    return { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
  }
}

export async function POST(request: Request) {
  try {
    const csvText = await request.text();
    if (!csvText) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    }
    const parsedCsv = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    const participants = parsedCsv.data;
    const processingPromises = participants.map(async (participant) => {
      const { "Nama Peserta": nama, "URL Profil Google Cloud Skills Boost": url } = participant;
      const { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount } = await scrapeProfile(url);
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
    const leaderboardData = await Promise.all(processingPromises);
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error processing leaderboard:', error);
    return NextResponse.json({ error: 'Failed to process leaderboard' }, { status: 500 });
  }
}
