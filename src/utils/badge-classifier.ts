import * as cheerio from 'cheerio';
import { skillBadgeNames } from './skill-badges';

// Badge classification patterns - exactly matching the original route
const PATTERNS = {
  trivia: /Skills Boost Arcade Trivia July 2025 Week [1-4]|Skills Boost Arcade Trivia August 2025 Week [1-4]|Skills Boost Arcade Trivia September 2025 Week [1-4]/i,
  arcade: /Skills Boost Arcade Base Camp July 2025|Skills Boost Arcade Certification Zone July 2025|Level 1: Core Infrastructure and Security|Level 2: Modern Application Deployment|Level 3: Advanced App Operations|Skills Boost Arcade Base Camp August 2025|Skills Boost Arcade Base Camp September 2025|Skills Boost Arcade Certification Zone August 2025|Level 1: Application Design and Delivery|Level 2: Building with Cloud Tools|Level 3: Terraform Essentials|Level 1: Cloud Infrastructure and Data Foundation|Level 2: AI and Data Innovation on Google Cloud|Level 3: Developer Essentials/i,
  extraSkill: /extra|ekstrakill|Arcade ExtraSkillesTrail|ExtraSkillestrial!|ExtraSkillestrial|Future Ready Skills|Skills Scribble/i,
  completion: /completion|completed|fundamentals|journey|preparing|introduction/i,
  excluded: /Work Meets Play: Banking With Empathy|Work Meets Play: Faster Finance/i, // These should not count as any badge type
};

export type BadgeType = 'skill' | 'arcade' | 'trivia' | 'extra' | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function classifyBadge($: cheerio.CheerioAPI, el: any): Promise<BadgeType> {
  const badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
  
  if (!badgeTitle) return null;
  
  // **START: Date Filtering Logic - exactly from original**
  const earnedText = $(el).text();
  const match = earnedText.match(/Earned\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/);
  
  // If no "Earned" date is found, skip this badge
  if (!match) {
    return null;
  }
  
  const earnedDate = new Date(match[1]);
  const minDate = new Date('2025-07-15');
  
  // If the badge was earned before the minimum date, skip it
  if (earnedDate < minDate) {
    return null;
  }
  // **END: Date Filtering Logic**

  // **START: Enhanced Badge Classification - exactly from original**
  const normalizedTitle = badgeTitle.toLowerCase();
  
  // Check for excluded badges first (should not count at all)
  if (PATTERNS.excluded.test(badgeTitle)) {
    console.log(`🚫 Excluding badge: ${badgeTitle}`);
    return null;
  }

  // Check for extra badges first (highest priority)
  if (PATTERNS.extraSkill.test(badgeTitle)) {
    return 'extra';
  }
  // Check for trivia badges
  else if (normalizedTitle.includes('trivia') || PATTERNS.trivia.test(badgeTitle)) {
    return 'trivia';
  }
  // Check for arcade badges (level-based or specific arcade patterns)
  else if (normalizedTitle.includes('level') || 
          normalizedTitle.includes('game') ||
          PATTERNS.arcade.test(badgeTitle)) {
    return 'arcade';
  }
  // Check completion badges by title pattern first
  else if (PATTERNS.completion.test(badgeTitle)) {
    return null; // Skip completion badges
  }
  // Check if it's a valid skill badge by looking up in our skill badge database
  else if (skillBadgeNames.includes(normalizedTitle)) {
    return 'skill';
  }

  // Check modal dialog for game badges as last resort
  const modalButton = $(el).find('ql-button[modal]');
  if (modalButton.length > 0) {
    const gameHref = $(el).find('ql-button[href]').attr('href') || '';
    if (gameHref.startsWith('/games/')) {
      // Check if it's trivia or arcade based on content
      return normalizedTitle.includes('trivia') ? 'trivia' : 'arcade';
    }
  }

  // Final fallback: if it passed all the above checks and no type was determined,
  // it's most likely a completion badge we missed - skip it
  return null; // Skip unknown badges rather than counting as skill
  // **END: Enhanced Badge Classification**
}
