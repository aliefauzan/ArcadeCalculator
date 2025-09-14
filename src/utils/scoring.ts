import { LeaderboardRow } from './cache-manager';

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

export function calculatePoints(skillBadgeCount: number, arcadeBadgeCount: number, triviaBadgeCount: number, extraSkillBadgeCount: number) {
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
  
  return {
    skillCount: skillBadgeCount,
    arcadeCount,
    triviaCount,
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
