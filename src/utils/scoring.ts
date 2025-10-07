import { LeaderboardRow } from './cache-manager';
import { BadgeCount } from './profile-scraper';

export interface ParticipantData {
  nama: string;
  skillCount: number;
  arcadeCount: number;
  triviaCount: number;
  skillPoints: number;
  arcadePoints: number;
  triviaPoints: number;
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  milestone: string;
  validStatsContribution: {
    validSkillCount: number;
    validArcadeCount: number;
    validTriviaCount: number;
    validExtraSkillCount: number;
  };
}

export function calculatePoints(badgeCount: BadgeCount) {
  const { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount, extraSkillBadgeCount, premiumExtraBadgeCount, milestoneEligible } = badgeCount;
  
  // Calculate base points using ALL badges (regardless of date)
  const arcadePoints = arcadeBadgeCount * 1.0;
  const triviaPoints = triviaBadgeCount * 1.0;
  const skillPoints = skillBadgeCount * 0.5;
  const extraSkillPoints = extraSkillBadgeCount * 2.0;
  const premiumExtraPoints = premiumExtraBadgeCount * 3.0;
  const basePoints = arcadePoints + triviaPoints + skillPoints + extraSkillPoints + premiumExtraPoints;

  // For milestone calculation, use only milestone-eligible badges
  const milestoneArcadeCount = milestoneEligible.arcadeBadgeCount + milestoneEligible.extraSkillBadgeCount + milestoneEligible.premiumExtraBadgeCount;
  const milestoneTriviaCount = milestoneEligible.triviaBadgeCount;
  const milestoneSkillCount = milestoneEligible.skillBadgeCount;
  
  // For display purposes, combine arcade + extraskill + premium extra counts (using all badges)
  const displayArcadeCount = arcadeBadgeCount + extraSkillBadgeCount + premiumExtraBadgeCount;
  const displayTriviaCount = triviaBadgeCount;
  const displaySkillCount = skillBadgeCount;
  
  let milestoneName = "";
  let bonusPoints = 0;

  // Milestone logic using ONLY milestone-eligible badges (earned before max date)
  if (milestoneArcadeCount >= 10 && milestoneTriviaCount >= 8 && milestoneSkillCount >= 44) {
    milestoneName = "ULTIMATE MASTER";
    bonusPoints = 28;
  } else if (milestoneArcadeCount >= 8 && milestoneTriviaCount >= 7 && milestoneSkillCount >= 30) {
    milestoneName = "GALAXY COMMANDER";
    bonusPoints = 19;
  } else if (milestoneArcadeCount >= 6 && milestoneTriviaCount >= 6 && milestoneSkillCount >= 20) {
    milestoneName = "SPACE PILOT";
    bonusPoints = 14;
  } else if (milestoneArcadeCount >= 4 && milestoneTriviaCount >= 4 && milestoneSkillCount >= 10) {
    milestoneName = "CADET";
    bonusPoints = 7;
  }
  
  const totalPoints = basePoints + bonusPoints;
  
  return {
    skillCount: displaySkillCount,
    arcadeCount: displayArcadeCount,
    triviaCount: displayTriviaCount,
    skillPoints,
    arcadePoints,
    triviaPoints,
    basePoints,
    bonusPoints,
    totalPoints,
    milestone: milestoneName || "-",
    // Add milestone-eligible counts for statistics
    validStatsContribution: {
      validSkillCount: milestoneSkillCount,
      validArcadeCount: milestoneEligible.arcadeBadgeCount + milestoneEligible.extraSkillBadgeCount + milestoneEligible.premiumExtraBadgeCount, // Include arcade, extra, and premium extra for display
      validTriviaCount: milestoneTriviaCount,
      validExtraSkillCount: milestoneEligible.extraSkillBadgeCount + milestoneEligible.premiumExtraBadgeCount
    }
  };
}

export function calculateTotalStats(leaderboard: LeaderboardRow[]) {
  // Calculate stats using only valid badges (earned between min and max date)
  const totalValidArcadeBadges = leaderboard.reduce((sum, p) => {
    return sum + (p.validStatsContribution?.validArcadeCount || 0);
  }, 0);
  
  const totalValidTriviaBadges = leaderboard.reduce((sum, p) => {
    return sum + (p.validStatsContribution?.validTriviaCount || 0);
  }, 0);
  
  const totalValidSkillBadges = leaderboard.reduce((sum, p) => {
    return sum + (p.validStatsContribution?.validSkillCount || 0);
  }, 0);
  
  const totalValidExtraSkillBadges = leaderboard.reduce((sum, p) => {
    return sum + (p.validStatsContribution?.validExtraSkillCount || 0);
  }, 0);
  
  const totalValidAllBadges = totalValidArcadeBadges + totalValidTriviaBadges + totalValidSkillBadges + totalValidExtraSkillBadges;
  
  return {
    totalAllBadges: totalValidAllBadges,
    totalArcadeBadges: totalValidArcadeBadges,
    totalTriviaBadges: totalValidTriviaBadges,
    totalSkillBadges: totalValidSkillBadges,
    totalExtraSkillBadges: totalValidExtraSkillBadges
  };
}
