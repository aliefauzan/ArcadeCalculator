'use client';

import React from 'react';

// Pixel art moon component
export function PixelMoon() {
    return (
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
}

// Pixel art spaceship component
export function PixelSpaceship({ className }: { className?: string }) {
    return (
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
}

// Star type for the animated background
export interface Star {
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    size: string;
}

// Generate random stars for the background
export function generateStars(count: number = 200): Star[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        size: `${Math.floor(Math.random() * 2) + 1}px`,
    }));
}

// Animated starfield background component
export function StarfieldBackground({ stars }: { stars: Star[] }) {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        backgroundColor: 'white',
                        animationDelay: star.animationDelay,
                    }}
                />
            ))}
            <PixelMoon />
            <PixelSpaceship className="absolute top-1/4 left-16" />
            <PixelSpaceship className="absolute bottom-1/4 right-16 transform -scale-x-100" />
        </div>
    );
}

// Last update timestamp display
export function LastUpdateBadge() {
    return (
        <div className="fixed top-4 right-4 bg-black/80 border-2 border-yellow-400/60 px-3 py-2 text-xs z-20">
            <div className="text-yellow-400 font-bold mb-1">LAST UPDATE</div>
            <div className="text-white">{process.env.BUILD_DATE}</div>
            <div className="text-gray-500 text-xs">{process.env.BUILD_TIME}</div>
        </div>
    );
}
