'use client';

import React from 'react';

interface ProfileFormProps {
    profileUrl: string;
    setProfileUrl: (url: string) => void;
    isLoading: boolean;
    error: string;
    onAnalyze: () => void;
}

export function ProfileForm({
    profileUrl,
    setProfileUrl,
    isLoading,
    error,
    onAnalyze,
}: ProfileFormProps) {
    return (
        <div className="bg-black/80 border-4 border-yellow-400 rounded-lg p-6 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,0,0.3)]">
            <h2 className="text-base sm:text-lg font-pixel text-yellow-400 mb-4 tracking-wider">
                &gt; ANALYZE PROFILE
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-pixel text-white mb-2 tracking-wide">
                        GOOGLE SKILLS PUBLIC PROFILE URL
                    </label>
                    <input
                        type="url"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        placeholder="https://www.skills.google/public_profiles/your-profile-id"
                        className="w-full px-4 py-3 bg-black border-2 border-yellow-400/70 rounded text-yellow-400 placeholder-yellow-600/50 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(255,255,0,0.5)] font-pixel text-xs transition-all"
                        disabled={isLoading}
                    />
                </div>

                <button
                    onClick={onAnalyze}
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
    );
}
