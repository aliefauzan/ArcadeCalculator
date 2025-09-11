import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load skill badge data for validation
interface SkillBadge {
  name: string;
  url: string;
  level: string;
  cost: string;
  keyword: string;
  duration: string;
  labs_count: string;
}

let skillBadgeNames: string[] = [];
try {
  const skillBadgeData: SkillBadge[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'skill-badges.json'), 'utf-8'));
  skillBadgeNames = skillBadgeData.map((badge) => badge.name.toLowerCase());
  console.log(`📚 Loaded ${skillBadgeNames.length} skill badge names for validation`);
} catch (error) {
  console.error('❌ Failed to load skill-badges.json:', error);
}

// 🚀 Cache for image dimensions to avoid re-downloading same images
const imageDimensionCache = new Map<string, { width: number; height: number }>();

// Function to get actual image dimensions for completion badge detection
async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  // Check cache first
  if (imageDimensionCache.has(url)) {
    return imageDimensionCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return { width: 0, height: 0 };
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    let dimensions = { width: 0, height: 0 };
    
    // Check for PNG signature
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
      // PNG format - width and height are at bytes 16-19 and 20-23
      const width = (uint8Array[16] << 24) | (uint8Array[17] << 16) | (uint8Array[18] << 8) | uint8Array[19];
      const height = (uint8Array[20] << 24) | (uint8Array[21] << 16) | (uint8Array[22] << 8) | uint8Array[23];
      dimensions = { width, height };
    }
    // Check for JPEG signature
    else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      // JPEG format - need to parse JPEG segments
      let i = 2;
      while (i < uint8Array.length - 4) {
        if (uint8Array[i] === 0xFF) {
          const marker = uint8Array[i + 1];
          if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
            // SOF (Start of Frame) marker found
            const height = (uint8Array[i + 5] << 8) | uint8Array[i + 6];
            const width = (uint8Array[i + 7] << 8) | uint8Array[i + 8];
            dimensions = { width, height };
            break;
          }
          const segmentLength = (uint8Array[i + 2] << 8) | uint8Array[i + 3];
          i += 2 + segmentLength;
        } else {
          i++;
        }
      }
    }
    
    // Cache the result
    imageDimensionCache.set(url, dimensions);
    return dimensions;
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
}

interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
}

// Simple in-memory cache with expiration
interface LeaderboardRow {
  nama: string;
  basePoints: number;
  totalPoints: number;
  milestone: string;
  skillCount: number;
  arcadeCount: number;
  triviaCount: number;
  bonusPoints: number;
}

interface CacheEntry {
  data: LeaderboardRow[];
  timestamp: number;
  expiresAt: number;
  totalStats?: {
    totalAllBadges: number;
    totalArcadeBadges: number;
    totalTriviaBadges: number;
    totalSkillBadges: number;
    totalExtraSkillBadges: number;
  };
}

const leaderboardCache: Record<string, CacheEntry> = {};

// Cache settings
const CACHE_DURATION_MS = 45 * 60 * 1000; // 45 minutes cache duration

function getCsvHash(csvText: string): string {
  return crypto.createHash('sha256').update(csvText).digest('hex');
}

function isCacheValid(cacheEntry: CacheEntry): boolean {
  const now = Date.now();
  return now < cacheEntry.expiresAt;
}

function cleanExpiredCache(): void {
  Object.keys(leaderboardCache).forEach(key => {
    if (!isCacheValid(leaderboardCache[key])) {
      console.log(`🗑️ Cleaning expired cache entry: ${key.substring(0, 8)}...`);
      delete leaderboardCache[key];
    }
  });
}

async function scrapeProfile(url: string) {
  if (!url) {
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
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
        return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const badges = $('.profile-badge');
      let skillBadgeCount = 0;
      let arcadeBadgeCount = 0;
      let triviaBadgeCount = 0;
      let extraSkillBadgeCount = 0; // Add separate counter for extraskill badges

      const triviaRegex = /Skills Boost Arcade Trivia July 2025 Week [1-4]|Skills Boost Arcade Trivia August 2025 Week [1-4]|Skills Boost Arcade Trivia September 2025 Week [1-4]/i;
      const arcadeRegex = /Skills Boost Arcade Base Camp July 2025|Skills Boost Arcade Certification Zone July 2025|Level 1: Core Infrastructure and Security|Level 2: Modern Application Deployment|Level 3: Advanced App Operations|Skills Boost Arcade Base Camp August 2025|Skills Boost Arcade Base Camp September 2025|Skills Boost Arcade Certification Zone August 2025|Level 1: Application Design and Delivery|Level 2: Building with Cloud Tools|Level 3: Terraform Essentials|Level 1: Cloud Infrastructure and Data Foundation|Level 2: AI and Data Innovation on Google Cloud|Level 3: Developer Essentials/i;
      const extraSkillRegex = /extra|ekstrakill|Arcade ExtraSkillesTrail|ExtraSkillestrial!|ExtraSkillestrial|Future Ready Skills|Skills Scribble/i;
      const completionRegex = /completion|completed|fundamentals|journey|preparing|introduction/i;
      // |Work Meets Play: Banking With Empathy|Work Meets Play: Faster Finance in arcadeRegex deleted
      
      // Define the minimum date for valid badges
      const minDate = new Date('2025-07-15');

      // 🚀 Process badges in parallel for better performance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processBadge = async (el: any) => {
        const badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
        
        // **START: Date Filtering Logic**
        // Extract the full text content of the badge element to find the date
        const earnedText = $(el).text();
        const match = earnedText.match(/Earned\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/);

        // If no "Earned" date is found, skip this badge
        if (!match) {
          return null;
        }
        
        const earnedDate = new Date(match[1]);

        // If the badge was earned before the minimum date, skip it
        if (earnedDate < minDate) {
          return null;
        }
        // **END: Date Filtering Logic**

        // **START: Enhanced Badge Classification (Optimized Logic)**
        // 1. Fast text-based classification first (no image download needed)
        const normalizedTitle = badgeTitle.toLowerCase();
        let badgeType = null;

        // Check for extra badges first (highest priority)
        if (extraSkillRegex.test(badgeTitle)) {
          badgeType = 'extra';
        }
        // Check for trivia badges
        else if (normalizedTitle.includes('trivia') || triviaRegex.test(badgeTitle)) {
          badgeType = 'trivia';
        }
        // Check for arcade badges (level-based or specific arcade patterns)
        else if (normalizedTitle.includes('level') || 
                normalizedTitle.includes('game') ||
                arcadeRegex.test(badgeTitle)) {
          badgeType = 'arcade';
        }
        // Check completion badges by title pattern first (before image check)
        else if (completionRegex.test(badgeTitle)) {
          return null; // Skip completion badges
        }
        // Check if it's a valid skill badge by looking up in our skill badge database
        else if (skillBadgeNames.includes(normalizedTitle)) {
          badgeType = 'skill';
        }
        
        // 2. Only check image dimensions if text classification is uncertain
        if (!badgeType) {
          const badgeImg = $(el).find('img[role="presentation"]');
          const imgSrc = badgeImg.attr('src') || '';
          
          if (imgSrc) {
            try {
              const dimensions = await getImageDimensions(imgSrc);
              // Completion badges have dimensions 1000×909 or 240×218
              const isCompletionBySize = (dimensions.width === 1000 && dimensions.height === 909) || 
                                        (dimensions.width === 240 && dimensions.height === 218);
              if (isCompletionBySize) {
                return null; // Skip completion badges
              }
            } catch (error) {
              console.error('Error checking image dimensions:', error);
            }
          }
          
          // Check modal dialog for game badges as last resort
          const modalButton = $(el).find('ql-button[modal]');
          if (modalButton.length > 0) {
            const gameHref = $(el).find('ql-button[href]').attr('href') || '';
            if (gameHref.startsWith('/games/')) {
              // Check if it's trivia or arcade based on content
              badgeType = normalizedTitle.includes('trivia') ? 'trivia' : 'arcade';
            }
          }
        }

        // Final fallback: if it passed all the above checks and no type was determined,
        // it's most likely a completion badge we missed - skip it
        if (!badgeType) {
          return null; // Skip unknown badges rather than counting as skill
        }

        return badgeType;
        // **END: Enhanced Badge Classification**
      };

      // Process all badges in parallel
      const badgePromises = Array.from(badges).map(processBadge);
      const badgeResults = await Promise.all(badgePromises);

      // Count the results
      for (const badgeType of badgeResults) {
        if (badgeType === 'trivia') {
          triviaBadgeCount++;
        } else if (badgeType === 'extra') {
          extraSkillBadgeCount++;
        } else if (badgeType === 'arcade') {
          arcadeBadgeCount++;
        } else if (badgeType === 'skill') {
          skillBadgeCount++;
        }
      }

      // console.log(`📊 Final counts - Skill: ${skillBadgeCount}, Arcade: ${arcadeBadgeCount}, Trivia: ${triviaBadgeCount}, ExtraSkill: ${extraSkillBadgeCount}`);
      // console.log(`📊 Display counts - Combined Arcade: ${arcadeBadgeCount + extraSkillBadgeCount}, Trivia: ${triviaBadgeCount}`);

      return { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount, extraSkillBadgeCount };

    } catch (error) {
      console.error(`Attempt ${attempt}: Failed to scrape ${url}:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed for URL: ${url}`);
  return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
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
    
    // Clean expired cache entries
    cleanExpiredCache();
    
    // Check if we have valid cached data
    const cachedEntry = leaderboardCache[csvHash];
    if (cachedEntry && isCacheValid(cachedEntry)) {
      const minutesRemaining = Math.ceil((cachedEntry.expiresAt - Date.now()) / (60 * 1000));
      console.log(`📋 Cache HIT: Returning cached data (expires in ${minutesRemaining} minutes)`);
      return NextResponse.json({ 
        cacheStatus: 'HIT', 
        leaderboard: cachedEntry.data,
        cacheExpiresIn: minutesRemaining + ' minutes',
        totalStats: cachedEntry.totalStats
      });
    }

    const parsedCsv = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });
    const participants = parsedCsv.data;
    const finalLeaderboardData = [];
    const BATCH_SIZE = 20; // Increased from 10 for faster processing

    for (let i = 0; i < participants.length; i += BATCH_SIZE) {
      const batch = participants.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batchStartTime = Date.now();
      console.log(`🚀 OPTIMIZED: Processing batch ${batchNumber} (${batch.length} participants)...`);

      const batchPromises = batch.map(async (participant) => {
        const { "Nama Peserta": nama, "URL Profil Google Cloud Skills Boost": url } = participant;
        const { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount, extraSkillBadgeCount } = await scrapeProfile(url);

        // Log badge counts for each participant before point calculation
        //const totalBadges = skillBadgeCount + arcadeBadgeCount + triviaBadgeCount + extraSkillBadgeCount;
        //console.log(`📊 ${nama} - Total badges: ${totalBadges} (${arcadeBadgeCount} arcade, ${triviaBadgeCount} trivia, ${skillBadgeCount} skill, ${extraSkillBadgeCount} extraskill)`);

        // Calculate points based on reference repository logic
        const arcadePoints = arcadeBadgeCount * 1.0;
        const triviaPoints = triviaBadgeCount * 1.0;
        const skillPoints = skillBadgeCount * 0.5;
        const extraSkillPoints = extraSkillBadgeCount * 2.0;
        const basePoints = arcadePoints + triviaPoints + skillPoints + extraSkillPoints;

        // For milestone calculation, add extraskill to arcade count
        const milestoneArcadeCount = arcadeBadgeCount + extraSkillBadgeCount;
        const arcadeCount = milestoneArcadeCount; // Display combined arcade+extraskill count
        const triviaCount = triviaBadgeCount;
        
        let milestoneName = "";
        let bonusPoints = 0;

        // Milestone logic using combined arcade+extraskill count
        if (milestoneArcadeCount >= 10 && triviaCount >= 8 && skillBadgeCount >= 44) {
          milestoneName = "ULTIMATE MASTER";
          bonusPoints = 28;
        } else if (milestoneArcadeCount >= 8 && triviaCount >= 7 && skillBadgeCount >= 30) {
          milestoneName = "GALAXY COMMANDER";
          bonusPoints = 19;
        } else if (milestoneArcadeCount >= 6 && triviaCount >= 6 && skillBadgeCount >= 20) {
          milestoneName = "SPACE PILOT";
          bonusPoints = 14;
        } else if (milestoneArcadeCount >= 4 && triviaCount >= 4 && skillBadgeCount >= 10) {
          milestoneName = "CADET";
          bonusPoints = 7;
        }
        
        const totalPoints = basePoints + bonusPoints;
        return { nama, basePoints, totalPoints, milestone: milestoneName || "-", skillCount: skillBadgeCount, arcadeCount, triviaCount, bonusPoints };
      });

      const batchResults = await Promise.all(batchPromises);
      finalLeaderboardData.push(...batchResults);
      // console.log(`✅ OPTIMIZED: Completed batch ${batchNumber} (${batchResults.length} participants) in ${((Date.now() - batchStartTime) / 1000).toFixed(2)}s`);
      
      // Removed inter-batch delay for faster processing
    }

    // Calculate and log total badges across all participants
    const totalArcadeBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.arcadeCount, 0);
    const totalTriviaBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.triviaCount, 0);
    const totalSkillBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.skillCount, 0);
    const totalExtraSkillBadges = 0; // Note: extraskill is included in arcadeCount for display
    const totalAllBadges = totalArcadeBadges + totalTriviaBadges + totalSkillBadges + totalExtraSkillBadges;
    
    //console.log(`🎯 TOTAL ALL PARTICIPANTS: ${totalAllBadges} badges (${totalArcadeBadges} arcade, ${totalTriviaBadges} trivia, ${totalSkillBadges} skill, ${totalExtraSkillBadges} extraskill)`);
    //console.log(`🎯 TOTAL ALL PARTICIPANTS: ${totalAllBadges} badges combined`);

    finalLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Prepare total stats for frontend
    const totalStats = {
      totalAllBadges,
      totalArcadeBadges,
      totalTriviaBadges,
      totalSkillBadges,
      totalExtraSkillBadges
    };
    
    // Store in cache with expiration
    const now = Date.now();
    leaderboardCache[csvHash] = {
      data: finalLeaderboardData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION_MS,
      totalStats
    };
    
    console.log(`💾 Cache STORED: Data cached for ${CACHE_DURATION_MS / (60 * 1000)} minutes`);
    
    // NOTE: Frontend should use leaderboardData.leaderboard.map(...) instead of leaderboardData.map(...)
    return NextResponse.json({ 
      cacheStatus: 'MISS', 
      leaderboard: finalLeaderboardData,
      cacheExpiresIn: (CACHE_DURATION_MS / (60 * 1000)) + ' minutes',
      totalStats
    });

  } catch (error) {
    console.error('Error processing leaderboard:', error);
    return NextResponse.json({ error: 'Failed to process leaderboard' }, { status: 500 });
  }
}