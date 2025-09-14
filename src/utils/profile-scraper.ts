import * as cheerio from 'cheerio';
import { classifyBadge } from './badge-classifier';
import { fetchWithRetry, BadgeCount } from './fetch-utils';

export async function scrapeProfile(url: string): Promise<BadgeCount> {
  if (!url) {
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
  }

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const badges = $('.profile-badge');

    // Process badges in parallel
    const badgePromises = Array.from(badges).map(el => classifyBadge($, el));
    const badgeResults = await Promise.all(badgePromises);

    // Count results
    const counts = { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
    
    for (const badgeType of badgeResults) {
      if (badgeType === 'trivia') counts.triviaBadgeCount++;
      else if (badgeType === 'extra') counts.extraSkillBadgeCount++;
      else if (badgeType === 'arcade') counts.arcadeBadgeCount++;
      else if (badgeType === 'skill') counts.skillBadgeCount++;
    }

    return counts;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return { skillBadgeCount: 0, arcadeBadgeCount: 0, triviaBadgeCount: 0, extraSkillBadgeCount: 0 };
  }
}
