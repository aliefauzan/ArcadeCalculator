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
}

export function calculatePoints(badgeCount: BadgeCount) {
  const { skillBadgeCount, arcadeBadgeCount, triviaBadgeCount, extraSkillBadgeCount, milestoneEligible } = badgeCount;
  
  // Calculate base points using ALL badges (regardless of date)
  const arcadePoints = arcadeBadgeCount * 1.0;
  const triviaPoints = triviaBadgeCount * 1.0;
  const skillPoints = skillBadgeCount * 0.5;
  const extraSkillPoints = extraSkillBadgeCount * 2.0;
  const basePoints = arcadePoints + triviaPoints + skillPoints + extraSkillPoints;

  // For milestone calculation, use only milestone-eligible badges
  const milestoneArcadeCount = milestoneEligible.arcadeBadgeCount + milestoneEligible.extraSkillBadgeCount;
  const milestoneTriviaCount = milestoneEligible.triviaBadgeCount;
  const milestoneSkillCount = milestoneEligible.skillBadgeCount;
  
  // For display purposes, combine arcade + extraskill counts (using all badges)
  const displayArcadeCount = arcadeBadgeCount + extraSkillBadgeCount;
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
    milestone: milestoneName || "-"
  };
}

export function calculateTotalStats(leaderboard: LeaderboardRow[]) {
  const totalArcadeBadges = leaderboard.reduce((sum, p) => sum + p.arcadeCount, 0);
  const totalTriviaBadges = leaderboard.reduce((sum, p) => sum + p.triviaCount, 0);
  const totalSkillBadges = leaderboard.reduce((sum, p) => sum + p.skillCount, 0);
  const totalExtraSkillBadges = 0; // Note: extraskill is included in arcadeCount for display
  const totalAllBadges = totalArcadeBadges + totalTriviaBadges + totalSkillBadges + totalExtraSkillBadges;
  
  return {
    totalAllBadges,
    totalArcadeBadges,
    totalTriviaBadges,
    totalSkillBadges,
    totalExtraSkillBadges
  };
}
