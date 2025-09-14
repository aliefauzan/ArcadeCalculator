import crypto from 'crypto';

export interface LeaderboardRow {
  nama: string;
  basePoints: number;
  totalPoints: number;
  milestone: string;
  skillCount: number;
  arcadeCount: number;
  triviaCount: number;
  bonusPoints: number;
}

export interface CacheEntry {
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
const CACHE_DURATION_MS = 45 * 60 * 1000; // 45 minutes

export function getCsvHash(csvText: string): string {
  return crypto.createHash('sha256').update(csvText).digest('hex');
}

export function isCacheValid(cacheEntry: CacheEntry): boolean {
  return Date.now() < cacheEntry.expiresAt;
}

export function getFromCache(hash: string): CacheEntry | null {
  const cached = leaderboardCache[hash];
  return cached && isCacheValid(cached) ? cached : null;
}

export function saveToCache(hash: string, data: LeaderboardRow[], totalStats?: CacheEntry['totalStats']): void {
  const now = Date.now();
  leaderboardCache[hash] = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION_MS,
    totalStats
  };
}

export function cleanExpiredCache(): void {
  Object.keys(leaderboardCache).forEach(key => {
    if (!isCacheValid(leaderboardCache[key])) {
      console.log(`🗑️ Cleaning expired cache entry: ${key.substring(0, 8)}...`);
      delete leaderboardCache[key];
    }
  });
}
