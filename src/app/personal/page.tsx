'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface PersonalData {
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

  const handleAnalyze = async (url?: string) => {
    const targetUrl = url || profileUrl;
    
    if (!targetUrl.trim()) {
      setError('Please enter a profile URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Add cache-busting parameter to force fresh scrape
      const timestamp = new Date().getTime();
      const response = await fetch('/api/personal-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl, timestamp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile');
      }

      setResult(data);
      
      // Update URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('profile', targetUrl);
      window.history.pushState({}, '', newUrl.toString());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for URL parameter on mount
  useEffect(() => {
    const urlParam = searchParams?.get('profile');
    if (urlParam && urlParam !== profileUrl) {
      setProfileUrl(urlParam);
      handleAnalyze(urlParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getMilestoneStyle = (milestone: string) => {
    if (milestone === "ULTIMATE MASTER")
      return "bg-gradient-to-r from-pink-500 to-violet-600 text-white border border-pink-300";
    if (milestone === "GALAXY COMMANDER") return "bg-yellow-400 text-black";
    if (milestone === "SPACE PILOT") return "bg-purple-500 text-white";
    if (milestone === "CADET") return "bg-green-500 text-white";
    return "bg-slate-700 text-slate-300";
  };

  // Arcade Tier based on TOTAL POINTS (same as team upload page)
  const getArcadeTier = (points: number) => {
    if (points >= 95) return { name: "Legend", stars: "⭐⭐⭐⭐⭐", emoji: "👑" };
    if (points >= 75) return { name: "Champion", stars: "⭐⭐⭐⭐", emoji: "🏆" };
    if (points >= 65) return { name: "Ranger", stars: "⭐⭐⭐", emoji: "🎖️" };
    if (points >= 45) return { name: "Trooper", stars: "⭐⭐", emoji: "🎯" };
    if (points >= 25) return { name: "Novice", stars: "⭐", emoji: "🌟" };
    return { name: "Unranked", stars: "", emoji: "🎮" };
  };

  // Moon component
  const PixelMoon = () => (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      className="absolute top-16 right-24 opacity-70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="60" fill="#E0E0E0" />
      <rect x="10" y="10" width="40" height="40" fill="#C0C0C0" />
      <rect x="20" y="20" width="20" height="20" fill="#E0E0E0" />
      <rect x="10" y="25" width="5" height="10" fill="#A0A0A0" />
      <rect x="40" y="15" width="10" height="10" fill="#A0A0A0" />
      <rect x="25" y="40" width="15" height="5" fill="#A0A0A0" />
    </svg>
  );

  // Spaceship component
  const PixelSpaceship = ({ className }: { className?: string }) => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="4" width="8" height="4" fill="#B0B0B0" />
      <rect x="16" y="8" width="16" height="4" fill="#DCDCDC" />
      <rect x="12" y="12" width="24" height="16" fill="#F0F0F0" />
      <rect x="16" y="28" width="16" height="4" fill="#DCDCDC" />
      <rect x="8" y="16" width="4" height="8" fill="#B0B0B0" />
      <rect x="36" y="16" width="4" height="8" fill="#B0B0B0" />
      <rect x="16" y="32" width="4" height="8" fill="#FFC107" />
      <rect x="28" y="32" width="4" height="8" fill="#FFC107" />
      <rect x="20" y="36" width="8" height="8" fill="#FF9800" />
    </svg>
  );

  // Generate stars on mount
  const [stars, setStars] = React.useState<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    size: string;
  }[]>([]);

  React.useEffect(() => {
    const generatedStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.floor(Math.random() * 2) + 1}px`,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', cursive;
        }
      `}</style>
      <div className="min-h-screen bg-[#0d112a] text-white relative overflow-hidden font-pixel">
        {/* Animated Starfield Background - matching upload page */}
        <div className="fixed inset-0 opacity-80">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.animationDelay,
              }}
            />
          ))}
          <PixelMoon />
          <PixelSpaceship className="absolute top-1/4 left-16" />
          <PixelSpaceship className="absolute bottom-1/4 right-16 transform -scale-x-100" />
        </div>

        {/* Last Update Timestamp */}
        <div className="fixed top-4 right-4 bg-black/80 border-2 border-yellow-400/60 px-3 py-2 text-xs z-20">
          <div className="text-yellow-400 font-bold mb-1">LAST UPDATE</div>
          <div className="text-white">{process.env.BUILD_DATE}</div>
          <div className="text-gray-500 text-xs">{process.env.BUILD_TIME}</div>
        </div>

        {/* Header matching team theme */}
        <div className="relative z-10 bg-black/90 border-b-4 border-yellow-400">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2 text-yellow-400 tracking-wider drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
                PERSONAL ANALYZER
              </h1>
              <p className="text-xs sm:text-sm text-white">
                ARCADE TEAM CALCULATOR - INDIVIDUAL PROFILE ANALYSIS
              </p>
              
              {/* Navigation Buttons */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/alief-fauzan1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-pixel text-base border-2 border-blue-400 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.599 2.001 3.599 4.604v5.592z" />
                  </svg>
                  <span>aliefauzan</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.599 2.001 3.599 4.604v5.592z" />
                  </svg>
                </a>
                
                <div className="relative inline-block">
                  <a
                    href="/upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-pixel text-base border-2 border-yellow-400 transition-all"
                  >
                    🏆 TEAM LEADERBOARD
                  </a>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-pixel px-2 py-1 rounded border border-red-400 animate-pulse">
                    TRY ME!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Input Section matching team theme */}
          <div className="bg-black/80 border-4 border-yellow-400 rounded-lg p-6 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,0,0.3)]">
            <h2 className="text-base sm:text-lg font-pixel text-yellow-400 mb-4 tracking-wider">
              &gt; ANALYZE PROFILE
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-pixel text-white mb-2 tracking-wide">
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
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 text-black font-pixel py-3 px-6 rounded tracking-widest text-xs sm:text-sm border-2 border-yellow-300 hover:shadow-[0_0_15px_rgba(255,255,0,0.6)] transition-all transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? '⚡ ANALYZING...' : '🚀 ANALYZE PROFILE'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-900/80 border-2 border-red-500 rounded text-red-300 font-mono text-xs">
                ❌ {error}
              </div>
            )}
          </div>

        {/* Results Section - Team Style */}
        {result && (
          <div className="bg-black/80 border-2 border-slate-500 p-6 rounded-lg mb-6 backdrop-blur-sm">
            {/* Header with Total Score, Arcade Tier (middle), and Milestone */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-slate-600">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="text-xs text-yellow-300 mb-2">TOTAL SCORE</div>
                <div className="text-5xl font-bold text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                  {result.data.totalPoints.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-2">ARCADE TIER</div>
                <div className="text-3xl">
                  {getArcadeTier(result.data.totalPoints).emoji}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {getArcadeTier(result.data.totalPoints).name}
                </div>
                <div className="text-xs text-yellow-400">
                  {getArcadeTier(result.data.totalPoints).stars}
                </div>
              </div>
              <div className="text-center mt-4 md:mt-0">
                <div className="text-xs text-slate-400 mb-2">MILESTONE</div>
                <div className={`inline-block px-6 py-3 rounded font-pixel text-sm ${getMilestoneStyle(result.data.milestone)}`}>
                  {result.data.milestone || 'NONE'}
                </div>
              </div>
            </div>

            {/* Points Breakdown Table */}
            <div className="bg-black/40 border-2 border-slate-600 rounded p-4 mb-6 overflow-x-auto">
              <h3 className="text-yellow-400 font-pixel text-xl font-bold mb-4 text-center">&gt; POINTS BREAKDOWN &lt;</h3>
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="py-2 px-2 text-yellow-300">CATEGORY</th>
                    <th className="py-2 px-2 text-center text-yellow-300">COUNT</th>
                    <th className="py-2 px-2 text-right text-yellow-300">POINTS</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2">🎮 SKILL BADGES</td>
                    <td className="py-2 px-2 text-center">{result.data.rawCounts.competitionPeriod.skillBadges}</td>
                    <td className="py-2 px-2 text-right">{result.data.skillPoints.toFixed(1)}</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2">🕹️ ARCADE GAMES</td>
                    <td className="py-2 px-2 text-center">{result.data.rawCounts.competitionPeriod.arcadeBadges}</td>
                    <td className="py-2 px-2 text-right">{result.data.arcadePoints.toFixed(1)}</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2">❓ TRIVIA GAMES</td>
                    <td className="py-2 px-2 text-center">{result.data.rawCounts.competitionPeriod.triviaBadges}</td>
                    <td className="py-2 px-2 text-right">{result.data.triviaPoints.toFixed(1)}</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2">⚡ EXTRA BADGES</td>
                    <td className="py-2 px-2 text-center">{result.data.rawCounts.extraBadges}</td>
                    <td className="py-2 px-2 text-right">{result.data.extraSkillPoints.toFixed(1)}</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2">💎 PREMIUM EXTRA</td>
                    <td className="py-2 px-2 text-center">{result.data.rawCounts.premiumExtraBadges}</td>
                    <td className="py-2 px-2 text-right">{result.data.premiumExtraPoints.toFixed(1)}</td>
                  </tr>
                  <tr className="border-t-2 border-yellow-400 bg-yellow-900/20">
                    <td className="py-2 px-2 font-bold">📌 BASE POINTS</td>
                    <td className="py-2 px-2 text-center">-</td>
                    <td className="py-2 px-2 text-right font-bold text-yellow-400">{result.data.basePoints.toFixed(1)}</td>
                  </tr>
                  <tr className="bg-purple-900/20">
                    <td className="py-2 px-2 font-bold">🌟 BONUS MILESTONE</td>
                    <td className="py-2 px-2 text-center">-</td>
                    <td className="py-2 px-2 text-right font-bold text-purple-400">+{result.data.bonusPoints}</td>
                  </tr>
                  <tr className="border-t-2 border-yellow-400 bg-yellow-500/20">
                    <td className="py-3 px-2 font-bold text-yellow-400 text-base">🏆 TOTAL SCORE</td>
                    <td className="py-3 px-2 text-center">-</td>
                    <td className="py-3 px-2 text-right font-bold text-yellow-400 text-lg">{result.data.totalPoints.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Arcade Tier Progress - Based on Total Points */}
            <div className="bg-black/40 border-2 border-slate-600 rounded p-4 mb-6">
              <h3 className="text-yellow-400 font-pixel text-xl font-bold mb-4 text-center">&gt; ARCADE TIER PROGRESS &lt;</h3>
              <div className="space-y-3">
                {[
                  { name: 'Novice', required: 25, emoji: '🌟' },
                  { name: 'Trooper', required: 45, emoji: '🎯' },
                  { name: 'Ranger', required: 65, emoji: '🎖️' },
                  { name: 'Champion', required: 75, emoji: '🏆' },
                  { name: 'Legend', required: 95, emoji: '👑' },
                ].map((tier) => {
                  const current = result.data.totalPoints;
                  const progress = Math.min((current / tier.required) * 100, 100);
                  const achieved = current >= tier.required;
                  
                  return (
                    <div key={tier.name} className={`p-3 rounded ${achieved ? 'bg-green-900/30 border border-green-500' : 'bg-slate-800/30 border border-slate-600'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{tier.emoji}</span>
                          <span className={`font-pixel text-xs ${achieved ? 'text-green-400' : 'text-slate-400'}`}>
                            {tier.name}
                          </span>
                        </div>
                        <span className={`text-xs ${achieved ? 'text-green-400' : 'text-yellow-400'}`}>
                          {current}/{tier.required}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${achieved ? 'bg-green-500' : 'bg-yellow-400'}`}
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Milestones Event - Using Correct Values from scoring.ts */}
            <div className="bg-black/40 border-2 border-slate-600 rounded p-4 mb-6">
              <h3 className="text-yellow-400 font-pixel text-xl font-bold mb-4 text-center">&gt; PROGRESS MILESTONES EVENT &lt;</h3>
              <div className="text-xs text-gray-400 mb-4 text-center border border-gray-600/50 bg-gray-900/50 p-2 rounded">
                Statistics below reflect only badges earned during the official competition timeframe<br />
                <strong className="text-gray-300">July 15 - September 16, 2025</strong>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'CADET', arcade: 4, trivia: 4, skill: 10, bonus: 7, bgColor: 'bg-green-900/20', borderColor: 'border-green-500', progressColor: 'bg-green-500' },
                  { name: 'SPACE PILOT', arcade: 6, trivia: 6, skill: 20, bonus: 14, bgColor: 'bg-purple-900/20', borderColor: 'border-purple-500', progressColor: 'bg-purple-500' },
                  { name: 'GALAXY COMMANDER', arcade: 8, trivia: 7, skill: 30, bonus: 19, bgColor: 'bg-yellow-900/20', borderColor: 'border-yellow-500', progressColor: 'bg-yellow-500' },
                  { name: 'ULTIMATE MASTER', arcade: 10, trivia: 8, skill: 44, bonus: 28, bgColor: 'bg-pink-900/20', borderColor: 'border-pink-500', progressColor: 'bg-gradient-to-r from-pink-500 to-violet-600' },
                ].map((m) => {
                  const totalArcade = result.data.rawCounts.competitionPeriod.arcadeBadges + 
                                    result.data.rawCounts.competitionPeriod.extraBadges + 
                                    result.data.rawCounts.competitionPeriod.premiumExtraBadges;
                  const isAchieved = 
                    totalArcade >= m.arcade &&
                    result.data.rawCounts.competitionPeriod.triviaBadges >= m.trivia &&
                    result.data.rawCounts.competitionPeriod.skillBadges >= m.skill;

                  return (
                    <div key={m.name} className={`p-4 rounded border-2 ${isAchieved ? m.bgColor + ' ' + m.borderColor : 'bg-slate-800/20 border-slate-600'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-pixel text-sm ${getMilestoneStyle(m.name)} px-3 py-1 rounded`}>
                          {m.name}
                        </span>
                        <span className="text-xs text-yellow-400">
                          Bonus: +{m.bonus} pts
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-slate-400 mb-1">🕹️ Arcade + Extra</div>
                          <div className="flex justify-between items-center">
                            <span className={totalArcade >= m.arcade ? 'text-green-400' : 'text-white'}>
                              {totalArcade}/{m.arcade}
                            </span>
                            <span className={totalArcade >= m.arcade ? 'text-green-400' : 'text-slate-500'}>
                              {totalArcade >= m.arcade ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-full rounded-full ${isAchieved ? m.progressColor : 'bg-slate-500'}`}
                              style={{width: `${Math.min((totalArcade / m.arcade) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">❓ Trivia</div>
                          <div className="flex justify-between items-center">
                            <span className={result.data.rawCounts.competitionPeriod.triviaBadges >= m.trivia ? 'text-green-400' : 'text-white'}>
                              {result.data.rawCounts.competitionPeriod.triviaBadges}/{m.trivia}
                            </span>
                            <span className={result.data.rawCounts.competitionPeriod.triviaBadges >= m.trivia ? 'text-green-400' : 'text-slate-500'}>
                              {result.data.rawCounts.competitionPeriod.triviaBadges >= m.trivia ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-full rounded-full ${isAchieved ? m.progressColor : 'bg-slate-500'}`}
                              style={{width: `${Math.min((result.data.rawCounts.competitionPeriod.triviaBadges / m.trivia) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">🎮 Skill</div>
                          <div className="flex justify-between items-center">
                            <span className={result.data.rawCounts.competitionPeriod.skillBadges >= m.skill ? 'text-green-400' : 'text-white'}>
                              {result.data.rawCounts.competitionPeriod.skillBadges}/{m.skill}
                            </span>
                            <span className={result.data.rawCounts.competitionPeriod.skillBadges >= m.skill ? 'text-green-400' : 'text-slate-500'}>
                              {result.data.rawCounts.competitionPeriod.skillBadges >= m.skill ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-full rounded-full ${isAchieved ? m.progressColor : 'bg-slate-500'}`}
                              style={{width: `${Math.min((result.data.rawCounts.competitionPeriod.skillBadges / m.skill) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  const shareUrl = window.location.origin + '/personal?profile=' + encodeURIComponent(profileUrl);
                  navigator.clipboard.writeText(shareUrl);
                  alert('LINK COPIED TO CLIPBOARD!');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-pixel py-3 px-6 rounded border-2 border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2 text-xs"
              >
                <span>📋</span>
                <span>COPY LINK</span>
              </button>
              <button
                onClick={() => window.location.href = '/upload'}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-pixel py-3 px-6 rounded border-2 border-yellow-300 hover:shadow-[0_0_15px_rgba(255,255,0,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2 text-xs"
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
                className="bg-gray-600 hover:bg-gray-500 text-white font-pixel py-3 px-6 rounded border-2 border-gray-400 hover:shadow-[0_0_15px_rgba(156,163,175,0.6)] transition-all transform hover:scale-105 flex items-center space-x-2 text-xs"
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
    </>
  );
}