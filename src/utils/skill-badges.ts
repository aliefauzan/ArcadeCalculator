import fs from 'fs';
import path from 'path';

interface SkillBadge {
  name: string;
  url: string;
  level: string;
  cost: string;
  keyword: string;
  duration: string;
  labs_count: string;
}

export let skillBadgeNames: string[] = [];

try {
  const skillBadgeData: SkillBadge[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'skill-badges.json'), 'utf-8')
  );
  skillBadgeNames = skillBadgeData.map((badge) => badge.name.toLowerCase());
  console.log(`📚 Loaded ${skillBadgeNames.length} skill badge names for validation`);
} catch (error) {
  console.error('❌ Failed to load skill-badges.json:', error);
}
