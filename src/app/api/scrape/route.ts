import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const badges = $('.profile-badge');
    let skillBadgeCount = 0;
    let arcadeBadgeCount = 0;
    let triviaBadgeCount = 0;

    badges.each((i, el) => {
      // Extract badge title from .ql-title-medium or .badge-title
      let badgeTitle = $(el).find('.ql-title-medium').text().trim();
      if (!badgeTitle) {
        badgeTitle = $(el).find('.badge-title').text().trim();
      }

      // Arcade detection
      const arcadePatterns = [
        /Level \d:/i,
        /Basecamp/i,
        /Cert(ification)? Zone/i,
        /Special Game/i,
        /Arcade Certification Zone/i,
        /Arcade Game/i
      ];
      // Trivia detection
      const triviaPatterns = [
        /Trivia/i,
        /Arcade Trivia/i
      ];

      if (arcadePatterns.some((pat) => pat.test(badgeTitle))) {
        arcadeBadgeCount++;
      } else if (triviaPatterns.some((pat) => pat.test(badgeTitle))) {
        triviaBadgeCount++;
      } else {
        skillBadgeCount++;
      }
    });

    const scrapedData = {
      skillBadgeCount,
      arcadeBadgeCount,
      triviaBadgeCount
    };

    return NextResponse.json(scrapedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scrape the profile' }, { status: 500 });
  }
}
