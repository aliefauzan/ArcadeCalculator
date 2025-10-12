import * as cheerio from 'cheerio';
import { classifyBadge } from './badge-classifier';
import { fetchWithRetry } from './fetch-utils';

export interface Badge {
  name: string;
  type: 'skill' | 'arcade' | 'trivia' | 'extra' | 'premiumExtra';
  earnedDate: string;
  countsForMilestone: boolean;
}

export interface BadgeCount {
  profileName?: string;
  profileImageUrl?: string;
  skillBadgeCount: number;
  arcadeBadgeCount: number;
  triviaBadgeCount: number;
  extraSkillBadgeCount: number;
  premiumExtraBadgeCount: number;
  // New: Separate counts for milestone-eligible badges
  milestoneEligible: {
    skillBadgeCount: number;
    arcadeBadgeCount: number;
    triviaBadgeCount: number;
    extraSkillBadgeCount: number;
    premiumExtraBadgeCount: number;
  };
  // New: Detailed badge lists
  badges: {
    skill: Badge[];
    arcade: Badge[];
    trivia: Badge[];
    extra: Badge[];
    premium: Badge[];
  };
}

export async function scrapeProfile(url: string): Promise<BadgeCount> {
  if (!url) {
    return { 
      skillBadgeCount: 0, 
      arcadeBadgeCount: 0, 
      triviaBadgeCount: 0, 
      extraSkillBadgeCount: 0,
      premiumExtraBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0,
        premiumExtraBadgeCount: 0
      },
      badges: {
        skill: [],
        arcade: [],
        trivia: [],
        extra: [],
        premium: []
      }
    };
  }

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract profile name
    const profileName = $('h1.ql-display-small').text().trim() || 
                       $('.profile-name').text().trim() || 
                       $('h1.profile-name').text().trim() ||
                       $('.ql-headline-1').first().text().trim() ||
                       $('[class*="profile"] h1').first().text().trim() ||
                       '';
    
    // Extract profile image URL
    const profileImageUrl = $('ql-avatar.profile-avatar').attr('src') || 
                           $('.profile-avatar img').attr('src') ||
                           $('img.profile-avatar').attr('src') ||
                           '';
    
    const badges = $('.profile-badge');

    // Process badges in parallel with details
    const badgeDetailsPromises = Array.from(badges).map(async (el) => {
      const badgeTitle = $(el).find('.ql-title-medium').text().trim() || $(el).find('.badge-title').text().trim();
      const earnedText = $(el).text();
      const match = earnedText.match(/Earned\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/);
      const earnedDate = match ? match[1] : '';
      
      const classification = await classifyBadge($, el);
      
      return {
        name: badgeTitle,
        type: classification.type,
        earnedDate,
        countsForMilestone: classification.countsForMilestone
      };
    });
    
    const badgeDetails = await Promise.all(badgeDetailsPromises);

    // Count results and organize badges
    const counts = { 
      profileName,
      profileImageUrl,
      skillBadgeCount: 0, 
      arcadeBadgeCount: 0, 
      triviaBadgeCount: 0, 
      extraSkillBadgeCount: 0,
      premiumExtraBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0,
        premiumExtraBadgeCount: 0
      },
      badges: {
        skill: [] as Badge[],
        arcade: [] as Badge[],
        trivia: [] as Badge[],
        extra: [] as Badge[],
        premium: [] as Badge[]
      }
    };
    
    for (const badge of badgeDetails) {
      if (!badge.type) continue;
      
      if (badge.type === 'trivia') {
        counts.triviaBadgeCount++;
        if (badge.countsForMilestone) counts.milestoneEligible.triviaBadgeCount++;
        counts.badges.trivia.push(badge as Badge);
      }
      else if (badge.type === 'premiumExtra') {
        counts.premiumExtraBadgeCount++;
        if (badge.countsForMilestone) counts.milestoneEligible.premiumExtraBadgeCount++;
        counts.badges.premium.push(badge as Badge);
      }
      else if (badge.type === 'extra') {
        counts.extraSkillBadgeCount++;
        if (badge.countsForMilestone) counts.milestoneEligible.extraSkillBadgeCount++;
        counts.badges.extra.push(badge as Badge);
      }
      else if (badge.type === 'arcade') {
        counts.arcadeBadgeCount++;
        if (badge.countsForMilestone) counts.milestoneEligible.arcadeBadgeCount++;
        counts.badges.arcade.push(badge as Badge);
      }
      else if (badge.type === 'skill') {
        counts.skillBadgeCount++;
        if (badge.countsForMilestone) counts.milestoneEligible.skillBadgeCount++;
        counts.badges.skill.push(badge as Badge);
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
      premiumExtraBadgeCount: 0,
      milestoneEligible: {
        skillBadgeCount: 0,
        arcadeBadgeCount: 0,
        triviaBadgeCount: 0,
        extraSkillBadgeCount: 0,
        premiumExtraBadgeCount: 0
      },
      badges: {
        skill: [],
        arcade: [],
        trivia: [],
        extra: [],
        premium: []
      }
    };
  }
}
