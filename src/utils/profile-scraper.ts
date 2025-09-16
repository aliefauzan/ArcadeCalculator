import * as cheerio from 'cheerio';
import { classifyBadge } from './badge-classifier';
import { fetchWithRetry } from './fetch-utils';

export interface BadgeCount {
  skillBadgeCount: number;
  arcadeBadgeCount: number;
  triviaBadgeCount: number;
  extraSkillBadgeCount: number;
  // New: Separate counts for milestone-eligible badges
  milestoneEligible: {
    skillBadgeCount: number;
    arcadeBadgeCount: number;
    triviaBadgeCount: number;
    extraSkillBadgeCount: number;
  };
}

export async function scrapeProfile(url: string): Promise<BadgeCount> {
  if (!url) {
    return { 
      skillBadgeCount: 0, 
      arcadeBadgeCount: 0, 
      triviaBadgeCount: 0, 
      extraSkillBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0
      }
    };
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
    const counts = { 
      skillBadgeCount: 0, 
      arcadeBadgeCount: 0, 
      triviaBadgeCount: 0, 
      extraSkillBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0
      }
    };
    
    for (const result of badgeResults) {
      if (result.type === 'trivia') {
        counts.triviaBadgeCount++;
        if (result.countsForMilestone) counts.milestoneEligible.triviaBadgeCount++;
      }
      else if (result.type === 'extra') {
        counts.extraSkillBadgeCount++;
        if (result.countsForMilestone) counts.milestoneEligible.extraSkillBadgeCount++;
      }
      else if (result.type === 'arcade') {
        counts.arcadeBadgeCount++;
        if (result.countsForMilestone) counts.milestoneEligible.arcadeBadgeCount++;
      }
      else if (result.type === 'skill') {
        counts.skillBadgeCount++;
        if (result.countsForMilestone) counts.milestoneEligible.skillBadgeCount++;
      }
    }

    return counts;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return { 
      skillBadgeCount: 0, 
      arcadeBadgeCount: 0, 
      triviaBadgeCount: 0, 
      extraSkillBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0
      }
    };
  }
}
