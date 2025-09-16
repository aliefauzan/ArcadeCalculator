import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { scrapeProfile } from '../../../utils/profile-scraper';
import { calculatePoints } from '../../../utils/scoring';
import { getCsvHash, getFromCache, saveToCache, cleanExpiredCache } from '../../../utils/cache-manager';

interface CsvRow {
  "Nama Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
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
    const cachedEntry = getFromCache(csvHash);
    if (cachedEntry) {
      const minutesRemaining = Math.ceil((cachedEntry.expiresAt - Date.now()) / (60 * 1000));
      console.log(`📋 Cache HIT: Returning cached data (expires in ${minutesRemaining} minutes)`);
      return NextResponse.json({ 
        cacheStatus: 'HIT', 
        leaderboard: cachedEntry.data,
        cacheExpiresIn: minutesRemaining + ' minutes',
        totalStats: cachedEntry.totalStats
      });
    }

    console.log('🚀 Starting CSV processing with micro-service architecture...');

    const parsedCsv = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });
    const participants = parsedCsv.data;
    const finalLeaderboardData = [];
    const BATCH_SIZE = 20; // Optimized batch size

    for (let i = 0; i < participants.length; i += BATCH_SIZE) {
      const batch = participants.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`🚀 MICRO: Processing batch ${batchNumber} (${batch.length} participants)...`);

      const batchPromises = batch.map(async (participant) => {
        const { "Nama Peserta": nama, "URL Profil Google Cloud Skills Boost": url } = participant;
        const badgeCount = await scrapeProfile(url);

        // Calculate points using the updated utility function
        const scoreData = calculatePoints(badgeCount);
        
        return { 
          nama, 
          basePoints: scoreData.basePoints, 
          totalPoints: scoreData.totalPoints, 
          milestone: scoreData.milestone, 
          skillCount: scoreData.skillCount, 
          arcadeCount: scoreData.arcadeCount, 
          triviaCount: scoreData.triviaCount, 
          bonusPoints: scoreData.bonusPoints 
        };
      });

      const batchResults = await Promise.all(batchPromises);
      finalLeaderboardData.push(...batchResults);
      
      console.log(`✅ MICRO: Completed batch ${batchNumber} (${batchResults.length} participants)`);
    }

    // Calculate total stats
    const totalArcadeBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.arcadeCount, 0);
    const totalTriviaBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.triviaCount, 0);
    const totalSkillBadges = finalLeaderboardData.reduce((sum, participant) => sum + participant.skillCount, 0);
    const totalExtraSkillBadges = 0; // Note: extraskill is included in arcadeCount for display
    const totalAllBadges = totalArcadeBadges + totalTriviaBadges + totalSkillBadges + totalExtraSkillBadges;

    // Sort by total score
    finalLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    
    const totalStats = {
      totalAllBadges,
      totalArcadeBadges,
      totalTriviaBadges,
      totalSkillBadges,
      totalExtraSkillBadges
    };

    console.log(`🎉 MICRO: Processing complete! Processed ${finalLeaderboardData.length} participants.`);

    // Store in cache with expiration
    saveToCache(csvHash, finalLeaderboardData, totalStats);
    console.log(`💾 Cache STORED: Data cached for 45 minutes`);

    return NextResponse.json({ 
      cacheStatus: 'MISS', 
      leaderboard: finalLeaderboardData,
      cacheExpiresIn: '45 minutes',
      totalStats
    });

  } catch (error) {
    console.error('❌ Error processing CSV:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}