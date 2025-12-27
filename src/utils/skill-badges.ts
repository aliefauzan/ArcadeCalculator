import fs from 'fs';
import path from 'path';
import type { SkillBadge } from '../types';

// Re-export the type for convenience
export type { SkillBadge };

// Load skill badge data (readonly to prevent mutation)
function loadSkillBadges(): { names: readonly string[]; badges: readonly SkillBadge[] } {
  try {
    const data: SkillBadge[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'skill-badges.json'), 'utf-8')
    );
    console.log(`📚 Loaded ${data.length} skill badge names for validation`);
    // Normalize whitespace when loading: lowercase + replace all whitespace sequences with single space
    return {
      names: Object.freeze(data.map(badge => badge.name.toLowerCase().replace(/\s+/g, ' ').trim())),
      badges: Object.freeze(data),
    };
  } catch (error) {
    console.error('❌ Failed to load skill-badges.json:', error);
    return { names: [], badges: [] };
  }
}

const { names, badges } = loadSkillBadges();

// Export as readonly constants
export const skillBadgeNames: readonly string[] = names;
export const allSkillBadges: readonly SkillBadge[] = badges;
