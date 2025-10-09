import { NextResponse } from 'next/server';
import { scrapeProfile } from '../../../utils/profile-scraper';
import { calculatePoints } from '../../../utils/scoring';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Profile URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!url.includes('cloudskillsboost.google') || !url.includes('public_profiles')) {
      return NextResponse.json(
        { error: 'Please provide a valid Google Cloud Skills Boost public profile URL' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing personal profile: ${url}`);
    
    // Scrape the profile
    const badgeCount = await scrapeProfile(url);
    
    // Calculate points and milestone
    const personalData = calculatePoints(badgeCount);
    
    // Extract profile name from URL for display (optional)
    const profileMatch = url.match(/public_profiles\/([^/?]+)/);
    const profileId = profileMatch ? profileMatch[1] : 'Unknown';
    
    console.log(`✅ Profile analysis complete for ${profileId}`);
    
    return NextResponse.json({
      success: true,
      profileId,
      profileUrl: url,
      data: {
        ...personalData,
        // Add raw badge counts for detailed breakdown
        rawCounts: {
          skillBadges: badgeCount.skillBadgeCount,
          arcadeBadges: badgeCount.arcadeBadgeCount,
          triviaBadges: badgeCount.triviaBadgeCount,
          extraBadges: badgeCount.extraSkillBadgeCount,
          premiumExtraBadges: badgeCount.premiumExtraBadgeCount,
          // Competition period counts
          competitionPeriod: {
            skillBadges: badgeCount.milestoneEligible.skillBadgeCount,
            arcadeBadges: badgeCount.milestoneEligible.arcadeBadgeCount,
            triviaBadges: badgeCount.milestoneEligible.triviaBadgeCount,
            extraBadges: badgeCount.milestoneEligible.extraSkillBadgeCount,
            premiumExtraBadges: badgeCount.milestoneEligible.premiumExtraBadgeCount,
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Personal profile analysis failed:', error);
    
    if (error instanceof Error && error.message.includes('403')) {
      return NextResponse.json(
        { error: 'Profile is private or inaccessible. Please make sure the profile is public.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze profile. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}

// Support GET request for URL parameter access
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileUrl = searchParams.get('profile');
  
  if (!profileUrl) {
    return NextResponse.json(
      { error: 'Profile URL parameter is required' },
      { status: 400 }
    );
  }
  
  // Forward to POST handler
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: profileUrl })
  }));
}