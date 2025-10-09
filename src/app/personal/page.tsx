'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Helper functions to match team theme
const getRankStyle = (totalPoints: number) => {
  if (totalPoints >= 100) return "bg-yellow-400 text-black border-2 border-yellow-500";
  if (totalPoints >= 75) return "bg-slate-300 text-black border-2 border-slate-400";
  if (totalPoints >= 50) return "bg-orange-400 text-black border-2 border-orange-500";
  return "bg-slate-700 text-white border-2 border-slate-500";
};

const getRankEmoji = (totalPoints: number) => {
  if (totalPoints >= 100) return "🏆";
  if (totalPoints >= 75) return "🥈";
  if (totalPoints >= 50) return "🥉";
  return "✨";
};

const getMilestoneStyle = (milestone: string) => {
  if (milestone === "ULTIMATE")
    return "bg-gradient-to-r from-pink-500 to-violet-600 text-white border border-pink-300";
  if (milestone === "3") return "bg-yellow-400 text-black";
  if (milestone === "2") return "bg-purple-500 text-white";
  if (milestone === "1") return "bg-green-500 text-white";
  return "bg-slate-700 text-slate-300";
};


interface PersonalData {
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
  rawCounts: {
    skillBadges: number;
    arcadeBadges: number;
    triviaBadges: number;
    extraBadges: number;
    premiumExtraBadges: number;
    competitionPeriod: {
      skillBadges: number;
      arcadeBadges: number;
      triviaBadges: number;
      extraBadges: number;
      premiumExtraBadges: number;
    };
  };
}

interface AnalysisResult {
  success: boolean;
  profileId: string;
  profileUrl: string;
  data: PersonalData;
}

export default function PersonalProfilePage() {
  const searchParams = useSearchParams();
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async (url?: string) => {
    const targetUrl = url || profileUrl;
    
    if (!targetUrl.trim()) {
      setError('Please enter a profile URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/personal-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile');
      }

      setResult(data);
      
      // Update URL if not already set via parameter
      if (!searchParams?.get('profile')) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('profile', targetUrl);
        window.history.pushState({}, '', newUrl.toString());
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [profileUrl, searchParams]);

  // Check for URL parameter on mount
  useEffect(() => {
    const urlParam = searchParams?.get('profile');
    if (urlParam) {
      setProfileUrl(urlParam);
      handleAnalyze(urlParam);
    }
  }, [searchParams, handleAnalyze]);

  const getMilestoneColor = (milestone: string) => {
    switch (milestone) {
      case 'ULTIMATE MASTER': return 'bg-gradient-to-r from-pink-500 to-violet-500';
      case 'GALAXY COMMANDER': return 'bg-yellow-500';
      case 'SPACE PILOT': return 'bg-purple-500';
      case 'CADET': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMilestoneIcon = (milestone: string) => {
    switch (milestone) {
      case 'ULTIMATE MASTER': return '🥇';
      case 'GALAXY COMMANDER': return '🥈';
      case 'SPACE PILOT': return '🥉';
      case 'CADET': return '🏅';
      default: return '⭐';
    }
  };

  const getArcadeTier = (arcadeBadges: number) => {
    if (arcadeBadges >= 50) return { name: 'ULTIMATE GAMER', stars: '★★★★★', color: 'bg-gradient-to-r from-pink-500 to-violet-500' };
    if (arcadeBadges >= 40) return { name: 'MASTER GAMER', stars: '★★★★', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    if (arcadeBadges >= 30) return { name: 'PRO GAMER', stars: '★★★', color: 'bg-gradient-to-r from-blue-400 to-purple-500' };
    if (arcadeBadges >= 20) return { name: 'SKILLED GAMER', stars: '★★', color: 'bg-gradient-to-r from-green-400 to-blue-500' };
    if (arcadeBadges >= 10) return { name: 'CASUAL GAMER', stars: '★', color: 'bg-gradient-to-r from-gray-400 to-gray-600' };
    return { name: 'ROOKIE', stars: '', color: 'bg-gray-500' };
  };

  const getArcadeTierColor = (arcadeBadges: number) => {
    return getArcadeTier(arcadeBadges).color;
  };

  const getArcadeTierIcon = (arcadeBadges: number) => {
    if (arcadeBadges >= 50) return '👑';
    if (arcadeBadges >= 40) return '🏆';
    if (arcadeBadges >= 30) return '🥇';
    if (arcadeBadges >= 20) return '🥈';
    if (arcadeBadges >= 10) return '🥉';
    return '🎮';
  };

  const getArcadeTierProgress = (arcadeBadges: number) => {
    const tiers = [
      { name: 'ROOKIE', required: 10, icon: '🎮', color: 'bg-gray-500' },
      { name: 'CASUAL GAMER', required: 20, icon: '🥉', color: 'bg-gradient-to-r from-gray-400 to-gray-600' },
      { name: 'SKILLED GAMER', required: 30, icon: '🥈', color: 'bg-gradient-to-r from-green-400 to-blue-500' },
      { name: 'PRO GAMER', required: 40, icon: '🥇', color: 'bg-gradient-to-r from-blue-400 to-purple-500' },
      { name: 'MASTER GAMER', required: 50, icon: '🏆', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
      { name: 'ULTIMATE GAMER', required: 100, icon: '👑', color: 'bg-gradient-to-r from-pink-500 to-violet-500' },
    ];

    return tiers.map(tier => ({
      ...tier,
      current: Math.min(arcadeBadges, tier.required),
      progress: (arcadeBadges / tier.required) * 100
    }));
  };



  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-pixel">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-blue-900/30 to-green-900/30">
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        <div className="clouds absolute inset-0"></div>
      </div>

      {/* Header matching team theme */}
      <div className="relative z-10 bg-black/90 border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-pixel text-yellow-400 tracking-wider drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
              👤 PERSONAL ANALYZER
            </h1>
            <div className="text-xs text-yellow-300 font-pixel">
              <div>ARCADE TEAM CALCULATOR</div>
              <div>PERSONAL PROFILE ANALYSIS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Input Section - matching team theme */}
        <div className="bg-black/80 border-4 border-yellow-400 rounded-lg p-6 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,0,0.3)]">
          <h2 className="text-lg font-pixel text-yellow-400 mb-4 tracking-wider">
            &gt; ANALYZE PROFILE
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-pixel text-yellow-300 mb-2 tracking-wide">
                GOOGLE CLOUD SKILLS BOOST PUBLIC PROFILE URL
              </label>
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.cloudskillsboost.google/public_profiles/your-profile-id"
                className="w-full px-4 py-3 bg-black border-2 border-yellow-400/70 rounded text-yellow-400 placeholder-yellow-600/50 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(255,255,0,0.5)] font-pixel text-xs transition-all"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading || !profileUrl.trim()}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 text-black font-pixel py-3 px-6 rounded tracking-widest text-sm border-2 border-yellow-300 hover:shadow-[0_0_15px_rgba(255,255,0,0.6)] transition-all transform hover:scale-105 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? '⚡ ANALYZING...' : '🚀 ANALYZE PROFILE'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/80 border-2 border-red-500 rounded text-red-300 font-mono">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Individual Rank Table - Team Style */}
            <div className="bg-black/80 border-4 border-yellow-400 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,0,0.3)]">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black p-4">
                <h3 className="font-pixel text-lg tracking-wider">👤 PERSONAL PROFILE ANALYSIS</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-yellow-400/20 border-b-2 border-yellow-400">
                      <th className="px-2 py-3 text-left font-pixel text-xs text-yellow-400 tracking-wider">RANK</th>
                      <th className="px-2 py-3 text-left font-pixel text-xs text-yellow-400 tracking-wider">PILOT</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">MILESTONE</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">SKILL</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">ARCADE</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">TRIVIA</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">BONUS</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">SCORE</th>
                      <th className="px-2 py-3 text-center font-pixel text-xs text-yellow-400 tracking-wider">ARCADE TIER</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-yellow-400/30 hover:bg-yellow-400/10 transition-colors">
                      <td className="px-2 py-4 font-pixel text-yellow-400 text-sm">-</td>
                      <td className="px-2 py-4 font-pixel text-white text-sm max-w-32 truncate" title="Personal Profile">
                        PERSONAL PROFILE
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`font-pixel text-xs px-2 py-1 rounded ${getMilestoneColor(result.data.milestone)} text-black`}>
                          {getMilestoneIcon(result.data.milestone)} {result.data.milestone || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center font-pixel text-white text-sm">
                        {result.data.rawCounts.skillBadges}
                      </td>
                      <td className="px-2 py-4 text-center font-pixel text-white text-sm">
                        {result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges}
                      </td>
                      <td className="px-2 py-4 text-center font-pixel text-white text-sm">
                        {result.data.rawCounts.triviaBadges}
                      </td>
                      <td className="px-2 py-4 text-center font-pixel text-yellow-400 text-sm">
                        +{result.data.bonusPoints}
                      </td>
                      <td className="px-2 py-4 text-center font-pixel text-green-400 text-sm font-bold">
                        {result.data.totalPoints.toFixed(1)}
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`font-pixel text-xs px-2 py-1 rounded ${getArcadeTierColor(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges)} text-black`}>
                          {getArcadeTierIcon(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges)} {getArcadeTier(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges).name}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Arcade Tier Progress */}
            <div className="bg-black/80 border-4 border-purple-400 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(128,0,128,0.3)]">
              <div className="bg-gradient-to-r from-purple-400 to-purple-300 text-black p-4">
                <h3 className="font-pixel text-lg tracking-wider">🎮 ARCADE TIER PROGRESS</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Current Tier Display */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getArcadeTierColor(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges)} text-black`}>
                    <span className="text-2xl">{getArcadeTierIcon(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges)}</span>
                    <span className="font-pixel text-lg">{getArcadeTier(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges).name}</span>
                  </div>
                  <p className="font-pixel text-white text-sm mt-2">
                    TOTAL ARCADE BADGES: {result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges}
                  </p>
                </div>

                {/* Tier Progress Bars */}
                <div className="space-y-3">
                  {getArcadeTierProgress(result.data.rawCounts.arcadeBadges + result.data.rawCounts.extraBadges + result.data.rawCounts.premiumExtraBadges).map((tier, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-pixel text-xs text-gray-300">{tier.icon} {tier.name}</span>
                        <span className="font-pixel text-xs text-gray-400">{tier.current}/{tier.required}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${tier.color}`}
                          style={{width: `${Math.min(tier.progress, 100)}%`}}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="font-pixel text-xs text-gray-400">{tier.progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Competition Period Stats */}
                <div className="mt-6 bg-blue-900/30 border border-blue-400 rounded-lg p-4">
                  <h4 className="font-pixel text-blue-400 text-sm mb-3">📅 COMPETITION PERIOD (JUL 15 - SEP 16, 2025)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="font-pixel text-xs text-gray-400">SKILL</div>
                      <div className="font-pixel text-white text-lg">{result.data.rawCounts.competitionPeriod.skillBadges}</div>
                    </div>
                    <div>
                      <div className="font-pixel text-xs text-gray-400">ARCADE</div>
                      <div className="font-pixel text-white text-lg">{result.data.rawCounts.competitionPeriod.arcadeBadges}</div>
                    </div>
                    <div>
                      <div className="font-pixel text-xs text-gray-400">TRIVIA</div>
                      <div className="font-pixel text-white text-lg">{result.data.rawCounts.competitionPeriod.triviaBadges}</div>
                    </div>
                    <div>
                      <div className="font-pixel text-xs text-gray-400">EXTRA</div>
                      <div className="font-pixel text-white text-lg">{result.data.rawCounts.competitionPeriod.extraBadges + result.data.rawCounts.competitionPeriod.premiumExtraBadges}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Team Style */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <button
                onClick={() => {
                  const shareUrl = window.location.origin + '/personal?profile=' + encodeURIComponent(profileUrl);
                  navigator.clipboard.writeText(shareUrl);
                  alert('LINK COPIED TO CLIPBOARD!');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-pixel py-3 px-6 rounded border-2 border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>📋</span>
                <span>COPY LINK</span>
              </button>
              <button
                onClick={() => window.location.href = '/upload'}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-pixel py-3 px-6 rounded border-2 border-yellow-300 hover:shadow-[0_0_15px_rgba(255,255,0,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🏆</span>
                <span>TEAM BOARD</span>
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setProfileUrl('');
                  setError('');
                  window.history.pushState({}, '', '/personal');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white font-pixel py-3 px-6 rounded border-2 border-gray-400 hover:shadow-[0_0_15px_rgba(156,163,175,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>NEW ANALYSIS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animated background */}
      <style jsx>{`
        @keyframes move-twink-back {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }
        @keyframes move-clouds-back {
          from { background-position: 0 0; }
          to { background-position: 10000px 0; }
        }
        .stars {
          background: #000 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="200" cy="200" r="1" fill="white"/><circle cx="400" cy="100" r="1" fill="white"/><circle cx="600" cy="300" r="1" fill="white"/><circle cx="800" cy="150" r="1" fill="white"/><circle cx="100" cy="400" r="1" fill="white"/><circle cx="300" cy="500" r="1" fill="white"/><circle cx="500" cy="600" r="1" fill="white"/><circle cx="700" cy="700" r="1" fill="white"/><circle cx="900" cy="450" r="1" fill="white"/></svg>') repeat;
        }
        .twinkling {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="150" cy="150" r="0.5" fill="white" opacity="0.8"/><circle cx="350" cy="250" r="0.5" fill="white" opacity="0.6"/><circle cx="550" cy="350" r="0.5" fill="white" opacity="0.9"/><circle cx="750" cy="450" r="0.5" fill="white" opacity="0.7"/></svg>') repeat;
          animation: move-twink-back 200s linear infinite;
        }
      `}</style>
    </div>
  );
}