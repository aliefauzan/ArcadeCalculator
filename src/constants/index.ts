// Scoring constants for the Arcade Calculator

// Point values per badge type
export const POINTS = {
    SKILL_BADGE: 0.5,
    ARCADE_GAME: 1.0,
    TRIVIA_GAME: 1.0,
    EXTRA_BADGE: 2.0,
    PREMIUM_EXTRA_BADGE: 3.0,
} as const;

// Milestone requirements
export const MILESTONES = {
    CADET: {
        name: 'CADET',
        arcade: 4,
        trivia: 4,
        skill: 10,
        bonus: 7,
    },
    SPACE_PILOT: {
        name: 'SPACE PILOT',
        arcade: 6,
        trivia: 6,
        skill: 20,
        bonus: 14,
    },
    GALAXY_COMMANDER: {
        name: 'GALAXY COMMANDER',
        arcade: 8,
        trivia: 7,
        skill: 30,
        bonus: 19,
    },
    ULTIMATE_MASTER: {
        name: 'ULTIMATE MASTER',
        arcade: 10,
        trivia: 8,
        skill: 44,
        bonus: 28,
    },
} as const;

// Arcade tier thresholds (based on total points)
export const ARCADE_TIERS = [
    { name: 'Novice', minPoints: 0, maxPoints: 24.9, stars: '⭐' },
    { name: 'Trooper', minPoints: 25, maxPoints: 44.9, stars: '⭐⭐' },
    { name: 'Ranger', minPoints: 45, maxPoints: 64.9, stars: '⭐⭐⭐' },
    { name: 'Champion', minPoints: 65, maxPoints: 94.9, stars: '⭐⭐⭐⭐' },
    { name: 'Legend', minPoints: 95, maxPoints: Infinity, stars: '⭐⭐⭐⭐⭐' },
] as const;

// Helper function to get arcade tier
export function getArcadeTier(points: number) {
    const tier = ARCADE_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints);
    return tier || ARCADE_TIERS[0];
}

// Helper function to get milestone style
export function getMilestoneStyle(milestone: string): string {
    switch (milestone) {
        case 'ULTIMATE MASTER':
            return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-purple-400 animate-pulse';
        case 'GALAXY COMMANDER':
            return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-2 border-blue-400';
        case 'SPACE PILOT':
            return 'bg-gradient-to-r from-green-600 to-emerald-500 text-white border-2 border-green-400';
        case 'CADET':
            return 'bg-gradient-to-r from-yellow-600 to-orange-500 text-white border-2 border-yellow-400';
        default:
            return 'bg-slate-700 text-slate-300 border-2 border-slate-500';
    }
}

// Parse duration string like "2 jam 30 menit" to minutes
export function parseDuration(duration: string): number {
    const hours = duration.match(/(\d+)\s*jam/)?.[1] || '0';
    const mins = duration.match(/(\d+)\s*menit/)?.[1] || '0';
    return parseInt(hours) * 60 + parseInt(mins);
}
