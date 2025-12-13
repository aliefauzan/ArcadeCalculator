// Shared types for the Arcade Calculator application

// Badge detail from profile scraping
export interface BadgeDetail {
    name: string;
    type: 'skill' | 'arcade' | 'trivia' | 'extra' | 'premiumExtra';
    earnedDate: string;
    countsForMilestone: boolean;
}

// Skill badge from skill-badges.json
export interface SkillBadge {
    name: string;
    url: string;
    level: 'Introductory' | 'Intermediate';
    cost: string;
    keyword: string;
    duration: string;
    labs_count: string;
}

// Badge counts from profile scraping
export interface BadgeCount {
    profileName?: string;
    profileImageUrl?: string;
    skillBadgeCount: number;
    arcadeBadgeCount: number;
    triviaBadgeCount: number;
    extraSkillBadgeCount: number;
    premiumExtraBadgeCount: number;
    milestoneEligible: {
        skillBadgeCount: number;
        arcadeBadgeCount: number;
        triviaBadgeCount: number;
        extraSkillBadgeCount: number;
        premiumExtraBadgeCount: number;
    };
    badges: {
        skill: BadgeDetail[];
        arcade: BadgeDetail[];
        trivia: BadgeDetail[];
        extra: BadgeDetail[];
        premium: BadgeDetail[];
    };
}

// Competition period counts
export interface CompetitionPeriodCounts {
    skillBadges: number;
    arcadeBadges: number;
    triviaBadges: number;
    extraBadges: number;
    premiumExtraBadges: number;
}

// Raw counts structure
export interface RawCounts {
    skillBadges: number;
    arcadeBadges: number;
    triviaBadges: number;
    extraBadges: number;
    premiumExtraBadges: number;
    competitionPeriod: CompetitionPeriodCounts;
}

// Personal data from analysis
export interface PersonalData {
    skillCount: number;
    arcadeCount: number;
    triviaCount: number;
    skillPoints: number;
    arcadePoints: number;
    triviaPoints: number;
    extraSkillPoints: number;
    premiumExtraPoints: number;
    basePoints: number;
    bonusPoints: number;
    totalPoints: number;
    milestone: string;
    rawCounts: RawCounts;
    badgeDetails?: {
        skill: BadgeDetail[];
        arcade: BadgeDetail[];
        trivia: BadgeDetail[];
        extra: BadgeDetail[];
        premium: BadgeDetail[];
    };
    allSkillBadges?: SkillBadge[];
}

// Analysis result from API
export interface AnalysisResult {
    success: boolean;
    profileId: string;
    profileName?: string;
    profileImageUrl?: string;
    profileUrl: string;
    data: PersonalData;
}

// Modal category type
export type ModalCategory = 'skill' | 'arcade' | 'trivia' | 'extra' | 'premium' | 'all' | 'missing' | null;

// Level filter type
export type LevelFilter = 'all' | 'Introductory' | 'Intermediate';

// Sort option type
export type SortOption = 'name' | 'duration' | 'labs';
