import * as cheerio from 'cheerio';
import { skillBadgeNames } from './skill-badges';

// Badge classification patterns - exactly matching the original route
const PATTERNS = {
  // 1pts
  trivia: new RegExp([
    'Skills Boost Arcade Trivia July 2025 Week [1-4]',
    'Skills Boost Arcade Trivia August 2025 Week [1-4]',
    'Skills Boost Arcade Trivia September 2025 Week [1-4]',
    'Skills Boost Arcade Trivia October 2025 Week [1-4]',
    "Google Skills Arcade Trivia November 2025 Week [1-4]",
    "Google Skills Arcade Trivia December 2025 Week [1-4]",
  ].join('|'), 'i'),
  
  // 1pts
  arcade: new RegExp([
    'Level [1-3]:',
    'Skills Boost Arcade Base Camp July 2025',
    'Skills Boost Arcade Certification Zone July 2025',
    'Skills Boost Arcade Base Camp August 2025',
    'Skills Boost Arcade Certification Zone August 2025',
    'Skills Boost Arcade Base Camp September 2025',
    'Skills Boost Arcade Certification Zone September 2025',
    'Skills Boost Arcade Base Camp October 2025',
    'Google Skills Arcade Certification Zone October 2025',
    'Google Skills Arcade Base Camp November 2025',
    'Google Skills Arcade Base Camp December 2025',
    'Google Skills Arcade Certification Zone December 2025',
  ].join('|'), 'i'),
  
  // 2pts
  extraSkill: new RegExp([
    'extra',
    'ekstrakill',
    'Arcade ExtraSkillesTrail',
    'ExtraSkillestrial!',
    'ExtraSkillestrial',
    'Future Ready Skills',
    'Skills Scribble',
    'Winter Wins'
  ].join('|'), 'i'),
  
  // 3pts
  premiumExtra: new RegExp([
    'Diwali Dialogues',
    'Lights & Logic'
  ].join('|'), 'i'),
  
  completion: /completion|completed|fundamentals|journey|preparing|introduction/i,
  
  excluded: new RegExp([
    'Work Meets Play: Banking With Empathy',
    'Work Meets Play: Faster Finance',
    'Work Meets Play: Scaling Success Challenge',
    'Work Meets Play: AI Assured',
    'Work Meets Play: Burger Bytes'
  ].join('|'), 'i'), // These should not count as any badge type
};

export type BadgeType = 'skill' | 'arcade' | 'trivia' | 'extra' | 'premiumExtra' | null;

export interface BadgeClassificationResult {
  type: BadgeType;
  countsForMilestone: boolean; // Whether this badge counts towards milestone calculation
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function classifyBadge($: cheerio.CheerioAPI, el: any): Promise<BadgeClassificationResult> {
  const badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
  
  if (!badgeTitle) return { type: null, countsForMilestone: false };
  
  // **START: Date Filtering Logic - exactly from original**
  const earnedText = $(el).text();
  const match = earnedText.match(/Earned\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/);
  
  // If no "Earned" date is found, skip this badge
  if (!match) {
    return { type: null, countsForMilestone: false };
  }
  
  const earnedDate = new Date(match[1]);
  const minDate = new Date('2025-07-15');
  const maxDate = new Date('2025-09-16'); // Maximum date for milestone eligibility
  
  // If the badge was earned before the minimum date, skip it
  if (earnedDate < minDate) {
    return { type: null, countsForMilestone: false };
  }
  
  // Determine if this badge counts for milestone calculation
  const countsForMilestone = earnedDate <= maxDate;
  // **END: Date Filtering Logic**

  // **START: Enhanced Badge Classification - exactly from original**
  const normalizedTitle = badgeTitle.toLowerCase();
  // Normalize whitespace: replace all whitespace sequences (including newlines) with single space
  const normalizedWhitespace = normalizedTitle.replace(/\s+/g, ' ').trim();
  
  // Check for excluded badges first (should not count at all)
  if (PATTERNS.excluded.test(badgeTitle)) {
  //  console.log(`🚫 Excluding badge: ${badgeTitle}`);
    return { type: null, countsForMilestone: false };
  }

  // Check for premium extra badges first (highest priority - 3 points)
  if (PATTERNS.premiumExtra.test(badgeTitle)) {
    return { type: 'premiumExtra', countsForMilestone };
  }
  // Check for regular extra badges (2 points)
  else if (PATTERNS.extraSkill.test(badgeTitle)) {
    return { type: 'extra', countsForMilestone };
  }
  // Check for trivia badges
  else if (normalizedTitle.includes('trivia') || PATTERNS.trivia.test(badgeTitle)) {
    return { type: 'trivia', countsForMilestone };
  }
  // Check for arcade badges (level-based or specific arcade patterns)
  else if (normalizedTitle.includes('level') || 
          normalizedTitle.includes('game') ||
          PATTERNS.arcade.test(badgeTitle)) {
    return { type: 'arcade', countsForMilestone };
  }
  // Check completion badges by title pattern first
  else if (PATTERNS.completion.test(badgeTitle)) {
    return { type: null, countsForMilestone: false }; // Skip completion badges
  }
  // Check if it's a valid skill badge by looking up in our skill badge database
  else if (skillBadgeNames.includes(normalizedWhitespace)) {
    return { type: 'skill', countsForMilestone };
  }

  // Check modal dialog for game badges as last resort
  const modalButton = $(el).find('ql-button[modal]');
  if (modalButton.length > 0) {
    const gameHref = $(el).find('ql-button[href]').attr('href') || '';
    if (gameHref.startsWith('/games/')) {
      // Check if it's trivia or arcade based on content
      return { 
        type: normalizedTitle.includes('trivia') ? 'trivia' : 'arcade', 
        countsForMilestone 
      };
    }
  }

  // Final fallback: if it passed all the above checks and no type was determined,
  // it's most likely a completion badge we missed - skip it
  return { type: null, countsForMilestone: false }; // Skip unknown badges rather than counting as skill
  // **END: Enhanced Badge Classification**
}
