'use client';

import React from 'react';
import type { SkillBadge, LevelFilter, SortOption } from '../types';
import { parseDuration } from '../constants';

interface MissingBadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
    allSkillBadges: SkillBadge[];
    earnedBadgeNames: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    levelFilter: LevelFilter;
    setLevelFilter: (filter: LevelFilter) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
}

export function MissingBadgesModal({
    isOpen,
    onClose,
    allSkillBadges,
    earnedBadgeNames,
    searchQuery,
    setSearchQuery,
    levelFilter,
    setLevelFilter,
    sortBy,
    setSortBy,
}: MissingBadgesModalProps) {
    if (!isOpen) return null;

    // Filter missing badges
    let missingBadges = allSkillBadges.filter(
        badge => !earnedBadgeNames.includes(badge.name.toLowerCase())
    );

    // Apply search filter
    if (searchQuery.trim()) {
        missingBadges = missingBadges.filter(badge =>
            badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            badge.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Apply level filter
    if (levelFilter !== 'all') {
        missingBadges = missingBadges.filter(badge => badge.level === levelFilter);
    }

    // Apply sorting
    missingBadges = [...missingBadges].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'duration') {
            return parseDuration(a.duration) - parseDuration(b.duration);
        } else {
            return parseInt(a.labs_count) - parseInt(b.labs_count);
        }
    });

    const allMissing = allSkillBadges.filter(
        badge => !earnedBadgeNames.includes(badge.name.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border-4 border-yellow-400 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-pixel text-yellow-400">
                        🔍 MISSING SKILL BADGES
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-400 text-2xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Compact Summary Bar */}
                    <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-400 font-bold">✓ {earnedBadgeNames.length}</span>
                            <span className="text-orange-400 font-bold">○ {allMissing.length}</span>
                            <span className="text-slate-400">/ {allSkillBadges.length} total</span>
                        </div>
                        <span className="text-xs text-slate-500">+0.5 pts each</span>
                    </div>

                    {/* Search + Filter Row */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 text-sm"
                        />
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
                            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none focus:border-orange-400"
                        >
                            <option value="all">All</option>
                            <option value="Introductory">Easy</option>
                            <option value="Intermediate">Medium</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none focus:border-orange-400"
                        >
                            <option value="name">A-Z</option>
                            <option value="duration">Fastest</option>
                            <option value="labs">Fewest Labs</option>
                        </select>
                    </div>

                    {/* Results Count */}
                    <div className="text-xs text-slate-400">
                        Showing {missingBadges.length} badges
                    </div>

                    {/* Badge List */}
                    <div className="max-h-80 overflow-y-auto space-y-1.5">
                        {missingBadges.length > 0 ? (
                            missingBadges.map((badge, idx) => (
                                <a
                                    key={idx}
                                    href={badge.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700 hover:border-orange-500 rounded transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white group-hover:text-orange-300 truncate">
                                            {badge.name}
                                        </div>
                                        <div className="flex gap-2 mt-1 text-[10px] text-slate-500">
                                            <span className={badge.level === 'Introductory' ? 'text-green-500' : 'text-purple-400'}>
                                                {badge.level === 'Introductory' ? 'Easy' : 'Medium'}
                                            </span>
                                            <span>•</span>
                                            <span>{badge.duration}</span>
                                            <span>•</span>
                                            <span>{badge.labs_count} labs</span>
                                        </div>
                                    </div>
                                    <span className="text-orange-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        →
                                    </span>
                                </a>
                            ))
                        ) : searchQuery || levelFilter !== 'all' ? (
                            <div className="text-center text-slate-400 py-8">
                                <div className="text-2xl mb-2">🔍</div>
                                <div className="text-sm">No badges match your filters</div>
                                <button
                                    onClick={() => { setSearchQuery(''); setLevelFilter('all'); }}
                                    className="mt-2 text-orange-400 hover:text-orange-300 text-xs underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-green-400 py-8">
                                <div className="text-4xl mb-2">🎉</div>
                                <div className="font-pixel">CONGRATULATIONS!</div>
                                <div className="text-sm text-slate-300 mt-2">
                                    You have earned all available skill badges!
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-yellow-600 hover:bg-yellow-500 text-white font-pixel py-3 rounded border-2 border-yellow-400 transition-all"
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
}
