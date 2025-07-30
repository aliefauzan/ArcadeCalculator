import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';
import crypto from 'crypto';


interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
}

// Simple in-memory cache
interface LeaderboardRow {
  nama: string;
  totalPoints: number;
  milestone: string;
  skillCount: number;
  arcadeCount: number;
  triviaCount: number;
  bonusPoints: number;
}
const leaderboardCache: Record<string, LeaderboardRow[]> = {};

function getCsvHash(csvText: string): string {
  return crypto.createHash('sha256').update(csvText).digest('hex');
}

async function scrapeProfile(url: string) {
  if (!url) {
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        console.error(`Attempt ${attempt}: Failed to fetch ${url} with status: ${response.status}`);
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const badges = $('.profile-badge');
      let skillBadgeCount = 0;
      let arcadeBadgeCount = 0;
      let triviaBadgeCount = 0;

      const triviaRegex = /Skills Boost Arcade Trivia July 2025 Week [1-4]/i;
      const arcadeRegex = /Skills Boost Arcade Base Camp July 2025|Skills Boost Arcade Certification Zone July 2025|Work Meets Play: Banking With Empathy|Level 1: Core Infrastructure and Security|Level 2: Modern Application Deployment|Level 3: Advanced App Operations/i;
      
      // Define the minimum date for valid badges
      const minDate = new Date('2025-07-15');

      badges.each((i, el) => {
        const badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
        
        // **START: Date Filtering Logic**
        // Extract the full text content of the badge element to find the date
        const earnedText = $(el).text();
        const match = earnedText.match(/Earned\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/);

        // If no "Earned" date is found, skip this badge
        if (!match) return;
        
        const earnedDate = new Date(match[1]);

        // If the badge was earned before the minimum date, skip it
        if (earnedDate < minDate) return;
        // **END: Date Filtering Logic**

        // If the date is valid, proceed with counting the badge type
        if (triviaRegex.test(badgeTitle)) {
          triviaBadgeCount++;
        } else if (arcadeRegex.test(badgeTitle)) {
          arcadeBadgeCount++;
        } else {
          skillBadgeCount++;
        }
      });

      return { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount };

    } catch (error) {
      console.error(`Attempt ${attempt}: Failed to scrape ${url}:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed for URL: ${url}`);
  return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0 };
}

export async function POST(request: Request) {
  try {
    let csvText = "";
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const csvFileContents: string[] = [];
      for (const entry of formData.entries()) {
        const value = entry[1];
        if (value instanceof File && value.type === 'text/csv') {
          csvFileContents.push(await value.text());
        }
      }

      if (csvFileContents.length === 0) {
        return NextResponse.json({ error: 'No CSV files found' }, { status: 400 });
      }

      const header = csvFileContents[0].split(/\r?\n/)[0];
      const allRows = csvFileContents.flatMap((content) => {
          const rows = content.split(/\r?\n/).slice(1);
          return rows.filter(row => row.trim() !== '');
      });
      csvText = [header, ...allRows].join('\n');

    } else {
      csvText = await request.text();
    }

    if (!csvText) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    }

    // Use hash of CSV content as cache key
    const csvHash = getCsvHash(csvText);
    if (leaderboardCache[csvHash]) {
      return NextResponse.json({ cacheStatus: 'caching content', leaderboard: leaderboardCache[csvHash] });
    }

    const parsedCsv = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });
    const participants = parsedCsv.data;
    const finalLeaderboardData = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < participants.length; i += BATCH_SIZE) {
      const batch = participants.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

      const batchPromises = batch.map(async (participant) => {
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
        return { nama, totalPoints, milestone: milestoneName || "-", skillCount: skillBadgeCount, arcadeCount, triviaCount, bonusPoints };
      });

      const batchResults = await Promise.all(batchPromises);
      finalLeaderboardData.push(...batchResults);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    finalLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboardCache[csvHash] = finalLeaderboardData;
    // NOTE: Frontend should use leaderboardData.leaderboard.map(...) instead of leaderboardData.map(...)
    return NextResponse.json({ cacheStatus: 'fresh content', leaderboard: finalLeaderboardData });

  } catch (error) {
    console.error('Error processing leaderboard:', error);
    return NextResponse.json({ error: 'Failed to process leaderboard' }, { status: 500 });
  }
}