"use client";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";

// Dynamically import the PDF component to avoid SSR issues
const PDFDownloadButton = dynamic(
  () => import("../../components/PDFDownloadButton").then((mod) => ({ default: mod.PDFDownloadButton })),
  { 
    ssr: false,
    loading: () => <div className="bg-yellow-400 text-black font-pixel text-sm p-3 border-2 border-slate-600">Loading PDF...</div>
  }
);

// Interface for the structure of each row in the uploaded CSV file.
interface CsvRow {
  "Nama Peserta": string;
  "Email Peserta": string;
  "Nomor HP Peserta": string;
  "URL Profil Google Cloud Skills Boost": string;
  "Status URL Profil": string;
  "Status Redeem Kode Akses": string;
  "Milestone yang Diselesaikan": string;
  "# Jumlah Skill Badge yang Diselesaikan": string;
  "Nama-nama Skill Badge yang Diselesaikan": string;
  "# Jumlah Game Arcade yang Diselesaikan": string;
  "Nama-nama Game Arcade yang Diselesaikan": string;
  "# Jumlah Game Trivia yang Diselesaikan": string;
  "Nama-nama Game Trivia yang Diselesaikan": string;
}

interface LeaderboardRow {
  nama: string;
  skillPoints: number;
  arcadePoints: number;
  triviaPoints: number;
  bonusPoints: number;
  basePoints: number;
  totalPoints: number;
  milestone: string;
  profileUrl: string;
  skillCount: number;
  arcadeCount: number;
  triviaCount: number;
}

interface ApiResponse {
  leaderboard: LeaderboardRow[];
  cacheStatus?: string;
  cacheExpiresIn?: string;
  totalStats?: {
    totalAllBadges: number;
    totalArcadeBadges: number;
    totalTriviaBadges: number;
    totalSkillBadges: number;
    totalExtraSkillBadges: number;
  };
}

// A component for a pixelated SVG moon
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

// A component for a pixelated SVG spaceship
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

// A component for a pixelated SVG rocket pointing right
const PixelRocket = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rocket body pointing right */}
    <rect x="4" y="6" width="10" height="4" fill="#F5F5F5" />
    <rect x="6" y="5" width="8" height="6" fill="#FFFFFF" />
    {/* Rocket nose */}
    <rect x="14" y="6" width="3" height="4" fill="#E0E0E0" />
    <rect x="17" y="7" width="2" height="2" fill="#E0E0E0" />
    <rect x="19" y="7.5" width="1" height="1" fill="#E0E0E0" />
    {/* Wings */}
    <rect x="10" y="2" width="4" height="3" fill="#D0D0D0" />
    <rect x="10" y="11" width="4" height="3" fill="#D0D0D0" />
    {/* Enhanced flame with more visibility */}
    <rect x="0" y="6" width="4" height="4" fill="#FF4500" />
    <rect x="0" y="5" width="2" height="2" fill="#FF6B35" />
    <rect x="0" y="9" width="2" height="2" fill="#FF6B35" />
    <rect x="2" y="7" width="2" height="2" fill="#FFD700" />
    {/* Window */}
    <rect x="11" y="7" width="2" height="2" fill="#87CEEB" />
    {/* Extra detail for visibility */}
    <rect x="8" y="7" width="1" height="2" fill="#FFD60A" />
  </svg>
);

// A component for the emoji-style rocket that matches the theme
const ThemeRocket = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rocket body pointing right */}
    <rect x="2" y="6" width="8" height="4" fill="#F5F5F5" />
    <rect x="4" y="5" width="6" height="6" fill="#FFFFFF" />
    {/* Rocket nose */}
    <rect x="10" y="6" width="2" height="4" fill="#E0E0E0" />
    <rect x="12" y="7" width="2" height="2" fill="#E0E0E0" />
    <rect x="14" y="7.5" width="1" height="1" fill="#E0E0E0" />
    {/* Wings */}
    <rect x="7" y="3" width="3" height="2" fill="#D0D0D0" />
    <rect x="7" y="11" width="3" height="2" fill="#D0D0D0" />
    {/* Flame */}
    <rect x="0" y="6" width="2" height="4" fill="#FF4500" />
    <rect x="0" y="5" width="1" height="2" fill="#FF6B35" />
    <rect x="0" y="9" width="1" height="2" fill="#FF6B35" />
    <rect x="1" y="7" width="1" height="2" fill="#FFD700" />
    {/* Window */}
    <rect x="7" y="7" width="2" height="2" fill="#87CEEB" />
  </svg>
);

// This wrapper component ensures its children are only rendered on the client side.
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

export default function UploadPage() {
  const [csvFiles, setCsvFiles] = useState<{ name: string; data: CsvRow[] }[]>(
    []
  );
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  type LeaderboardRow = {
    nama: string;
    skillPoints: number;
    arcadePoints: number;
    triviaPoints: number;
    bonusPoints: number;
    basePoints: number;
    totalPoints: number;
    milestone: string;
    skillCount: number;
    arcadeCount: number;
    triviaCount: number;
  };
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileCacheStatus, setFileCacheStatus] = useState<Record<string, {status: string, expiresIn: string}>>({});
  const [progress, setProgress] = useState(0); // 0-100
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple simultaneous calls
  const [totalStats, setTotalStats] = useState<{
    totalAllBadges: number;
    totalArcadeBadges: number;
    totalTriviaBadges: number;
    totalSkillBadges: number;
    totalExtraSkillBadges: number;
  } | null>(null);
  const [stars, setStars] = useState<
    {
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      size: string;
    }[]
  >([]);

  // Constants
  const BATCH_SIZE = 10; // Same as in the API
  const MAX_FILES = 2;

  // Helper functions
  const updateProgress = (value: number) => {
    setProgress(Math.min(value, 100));
  };

  const resetLoadingState = () => {
    setLoading(false);
    setProgress(0);
    setIsProcessing(false);
  };

  const setInitialCacheStatus = (files: { name: string; data: CsvRow[] }[]) => {
    const initialCacheStatus: Record<string, {status: string, expiresIn: string}> = {};
    files.forEach((file) => {
      initialCacheStatus[file.name] = {
        status: 'PROCESSING',
        expiresIn: ''
      };
    });
    setFileCacheStatus(initialCacheStatus);
  };

  const updateCacheStatus = (cacheStatus?: string, cacheExpiresIn?: string) => {
    if (cacheStatus && cacheExpiresIn) {
      const newCacheStatus: Record<string, {status: string, expiresIn: string}> = {};
      csvFiles.forEach((file) => {
        newCacheStatus[file.name] = {
          status: cacheStatus,
          expiresIn: cacheExpiresIn
        };
      });
      setFileCacheStatus(newCacheStatus);
    }
  };

  const transformLeaderboardData = (data: LeaderboardRow[]): LeaderboardRow[] => {
    return data.map((row: LeaderboardRow) => {
      let milestoneNum = "-";
      if (row.milestone === "ULTIMATE MASTER") milestoneNum = "ULTIMATE";
      else if (row.milestone === "GALAXY COMMANDER") milestoneNum = "3";
      else if (row.milestone === "SPACE PILOT") milestoneNum = "2";
      else if (row.milestone === "CADET") milestoneNum = "1";
      else if (["1", "2", "3", "4"].includes(row.milestone))
        milestoneNum = row.milestone;
      return {
        nama: row.nama,
        skillPoints: row.skillCount * 0.5,
        arcadePoints: row.arcadeCount,
        triviaPoints: row.triviaCount,
        bonusPoints: row.bonusPoints,
        basePoints: row.basePoints,
        totalPoints: row.totalPoints,
        milestone: milestoneNum,
        skillCount: row.skillCount,
        arcadeCount: row.arcadeCount,
        triviaCount: row.triviaCount,
      };
    });
  };

  const fetchLeaderboardData = async (csvText: string): Promise<ApiResponse | null> => {
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch("/api/process-leaderboard", {
          method: "POST",
          headers: { "Content-Type": "text/csv" },
          body: csvText,
        });
        
        if (!res.ok) throw new Error("Failed to process leaderboard");
        
        const leaderboardData = await res.json();
        return leaderboardData;
      } catch {
        if (attempt === maxRetries) return null;
        await new Promise((resolve) => setTimeout(resolve, 1200)); // Wait before retry
      }
    }
    return null;
  };

  useEffect(() => {
    const generatedStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.floor(Math.random() * 2) + 1}px`,
    }));
    setStars(generatedStars);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} CSV files.`);
      return;
    }

    setLoading(true);
    setError(null);
    setLeaderboard([]);
    setProgress(0);

    const parsePromises = Array.from(files).map((file) => {
      return new Promise<{ name: string; data: CsvRow[] }>(
        (resolve, reject) => {
          Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<CsvRow>) => {
              if (results.errors.length) {
                reject("CSV parsing error: " + results.errors[0].message);
              } else {
                resolve({ name: file.name, data: results.data });
              }
            },
          });
        }
      );
    });

    Promise.all(parsePromises)
      .then(async (allFiles) => {
        setCsvFiles(allFiles);
        setSelectedFiles(allFiles.map((_, idx) => idx)); // Select all by default
        setInitialCacheStatus(allFiles);
        
        // Remove the delay and call updateLeaderboard immediately
        updateLeaderboard(
          allFiles,
          allFiles.map((_, idx) => idx)
        );
      })
      .catch((err) => {
        setError(typeof err === "string" ? err : "CSV parsing error");
        resetLoadingState();
      });
  };

  const updateLeaderboard = async (
    files: { name: string; data: CsvRow[] }[],
    selected: number[]
  ) => {
    // Prevent multiple simultaneous processing
    if (isProcessing) {
      return;
    }
    
    // Don't process if no files selected
    if (selected.length === 0 || files.length === 0) {
      return;
    }
    
    // The backend now handles all date filtering, so we can combine rows directly.
    const combinedRows = selected.flatMap(idx => files[idx]?.data || []);
    
    setIsProcessing(true);
    setLoading(true);
    setProgress(0); // Reset progress only at the start
    
    // Calculate total participants and expected batches
    const totalParticipants = combinedRows.length;
    const totalBatches = Math.ceil(totalParticipants / BATCH_SIZE);
    
    // Use the combined rows directly
    const csvText = Papa.unparse(combinedRows);

    try {
      // Start with initial progress
      updateProgress(10);
      
      // Create a smooth progress animation that estimates based on typical API time
      const estimatedTotalTime = totalBatches * 3000; // 3 seconds per batch estimate
      const updateInterval = 500; // Update every 500ms
      const progressIncrement = 80 / (estimatedTotalTime / updateInterval); // 80% for processing
      
      let currentProgress = 10;
      const progressTimer = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress < 90) {
          updateProgress(Math.round(currentProgress));
        }
      }, updateInterval);
      
      const leaderboardData = await fetchLeaderboardData(csvText);
      
      // Clear the timer when API completes
      clearInterval(progressTimer);
      
      // Complete the progress
      updateProgress(100);
      
      // Update cache status for the current files
      updateCacheStatus(leaderboardData?.cacheStatus, leaderboardData?.cacheExpiresIn);
      
      if (leaderboardData && leaderboardData.leaderboard) {
        const transformedData = transformLeaderboardData(leaderboardData.leaderboard);
        setLeaderboard(transformedData);
        setTotalStats(leaderboardData.totalStats || null);
        setError(null);
      } else {
        setError(
          "Failed to process leaderboard after several attempts. Please try again."
        );
        setLeaderboard([]);
        setTotalStats(null);
      }
    } catch {
      setError('An error occurred while processing the leaderboard');
      setLeaderboard([]);
      setTotalStats(null);
    }
    
    // Small delay to show 100% completion before hiding
    setTimeout(() => {
      resetLoadingState();
    }, 500);
  };

  const handleCheckboxChange = (idx: number) => {
    // Don't allow changes while processing
    if (isProcessing) {
      return;
    }
    
    let updated = selectedFiles.includes(idx)
      ? selectedFiles.filter((i) => i !== idx)
      : [...selectedFiles, idx];
    updated = updated.sort();
    setSelectedFiles(updated);
    updateLeaderboard(csvFiles, updated);
  };

  const getRankStyle = (index: number) => {
    if (index === 0)
      return "bg-yellow-400 text-black border-2 border-yellow-500";
    if (index === 1) return "bg-slate-300 text-black border-2 border-slate-400";
    if (index === 2)
      return "bg-orange-400 text-black border-2 border-orange-500";
    return "bg-slate-700 text-white border-2 border-slate-500";
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
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

  const getArcadeTier = (points: number) => {
    if (points >= 95) return { name: "Legend", stars: "⭐⭐⭐⭐⭐" };
    if (points >= 75) return { name: "Champion", stars: "⭐⭐⭐⭐" };
    if (points >= 65) return { name: "Ranger", stars: "⭐⭐⭐" };
    if (points >= 45) return { name: "Trooper", stars: "⭐⭐" };
    if (points >= 25) return { name: "Novice", stars: "⭐" };
    return { name: "Unranked", stars: "" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', cursive;
        }
      `}</style>
      <div className="min-h-screen bg-[#0d112a] text-white relative overflow-hidden font-pixel">
        {/* Animated starfield background */}
        <div className="fixed inset-0 opacity-80">
          <ClientOnly>
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
          </ClientOnly>
        </div>

        {/* Decorative Scrollbar */}
        <div className="fixed top-0 right-0 h-full w-8 bg-black/30 flex flex-col items-center py-4">
          <div className="w-4 h-4 bg-slate-500 border-2 border-slate-400 mb-2"></div>
          <div className="flex-grow w-2 bg-slate-700"></div>
          <div className="w-4 h-4 bg-slate-500 border-2 border-slate-400 mt-2"></div>
        </div>

        {/* Decorative 'N' icon */}
        <div className="fixed bottom-4 left-4 w-8 h-8 bg-slate-800 border-2 border-slate-500 flex items-center justify-center text-yellow-400">
          N
        </div>

        <div className="relative z-10 flex flex-col items-center justify-start p-6 sm:p-10 min-h-screen">
          <div className="w-full max-w-[1400px] mx-auto">
            {/* Enhanced Header */}
            <header className="text-center mb-12 py-4">
              <h1 className="text-3xl sm:text-4xl mb-2 text-yellow-400 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
                THE ARCADE
              </h1>
              <p className="text-lg sm:text-xl font-bold text-white tracking-widest">
                LEADERBOARD
              </p>
              <div className="mt-4 flex flex-col items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/alief-fauzan1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-pixel text-base border-2 border-blue-400"
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
              </div>
            </header>

            {/* Upload Section */}
            <section className="bg-black/50 border-2 border-slate-500 p-6 mb-8">
              <label
                htmlFor="file-upload"
                className="text-yellow-400 mb-3 block text-base"
              >
                &gt; UPLOAD CSV:
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileUpload}
                className="w-full p-3 bg-slate-800 border-2 border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-yellow-400 file:text-black font-pixel text-sm hover:file:bg-yellow-300 focus:outline-none focus:border-yellow-400"
              />
              {/* Checkbox selection for each file */}
              {csvFiles.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-yellow-300 font-bold mb-2">
                    Select CSV to show:
                  </span>
                  {csvFiles.map((file, idx) => (
                    <label
                      key={file.name}
                      className="flex items-center justify-between gap-2 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(idx)}
                          onChange={() => handleCheckboxChange(idx)}
                          className="accent-yellow-400 w-4 h-4"
                        />
                        <span>{file.name}</span>
                      </div>
                      
                      {/* Cache Status Indicator for each file */}
                      {fileCacheStatus[file.name] && (
                        <div className="flex items-center gap-2 bg-gray-800/60 rounded px-3 py-1">
                          <span className="text-xs font-pixel text-gray-300">Cache Status:</span>
                          <div className={`w-2 h-2 rounded-full ${
                            fileCacheStatus[file.name].status === 'HIT' ? 'bg-green-400' : 
                            fileCacheStatus[file.name].status === 'PROCESSING' ? 'bg-yellow-400 animate-pulse' : 
                            'bg-blue-400'
                          }`}></div>
                          <span className="text-xs font-pixel">
                            {fileCacheStatus[file.name].status === 'HIT' ? 'CACHED' : 
                             fileCacheStatus[file.name].status === 'PROCESSING' ? 'PROCESSING...' :
                             'FRESH'}
                          </span>
                          {fileCacheStatus[file.name].expiresIn && (
                            <span className="text-xs text-gray-400">
                              ({fileCacheStatus[file.name].expiresIn})
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/80 border-2 border-red-500 text-white p-4 mb-8">
                <div className="font-bold mb-1 text-red-400">&gt; ERROR:</div>
                <div>{error}</div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="border-2 border-yellow-400 bg-black/80 p-8 mb-8 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                {/* Animated pixel spaceship */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <PixelSpaceship className="animate-spin-slow" />
                  {/* Animated stars */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-yellow-300 opacity-80"
                      style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        left: `${Math.random() * 90}%`,
                        top: `${Math.random() * 90}%`,
                        animation: `star-flicker 1.2s infinite ${Math.random()}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-lg animate-pulse font-pixel text-yellow-300 mt-4">
                  &gt; SCRAPING &amp; CALCULATING...
                </span>
                
                {/* Progress bar with animated rocket */}
                <div className="w-full max-w-2xl mt-4">
                  <div className="h-6 bg-slate-800 rounded overflow-hidden relative border-2 border-slate-600">
                    <div
                      className="h-6 bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Rocket that follows the progress */}
                    {progress > 0 && (
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
                        style={{ 
                          left: `${Math.min(progress, 95)}%`,
                          zIndex: 10
                        }}
                      >
                        <PixelRocket className="drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] filter brightness-110" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center mt-3 relative">
                    {/* Centered percentage with theme rocket */}
                    {loading && (
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-yellow-400 text-lg">
                          {Math.round(progress)}%
                        </span>
                        <ThemeRocket className="animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                
                <style>{`
                  @keyframes star-flicker {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 0.2; }
                  }
                  .animate-spin-slow {
                    animation: spin 2.5s linear infinite;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {/* Leaderboard Table */}
            {leaderboard.length > 0 && (
              <section className="w-full mt-4">
                <div className="flex justify-end mb-4">
                  <ClientOnly>
                    <PDFDownloadButton data={leaderboard} />
                  </ClientOnly>
                </div>

                <div className="border-2 border-yellow-400 bg-black/70 overflow-hidden">
                  <div>
                    <table className="w-full min-w-[1350px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-yellow-400">
                          <th className="p-3 text-left text-yellow-300 tracking-wider">
                            RANK
                          </th>
                          <th className="p-3 text-left text-yellow-300 tracking-wider">
                            PILOT
                          </th>
                          <th className="p-3 text-left text-yellow-300 tracking-wider">
                            MILESTONE
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            SKILL
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            ARCADE
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            TRIVIA
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            BONUS
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            SCORE
                          </th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">
                            ARCADE TIER
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-yellow-400/30 hover:bg-yellow-400/10"
                          >
                            <td className="p-3 font-bold">
                              <div
                                className={`inline-flex items-center gap-2 px-2 py-1 text-xs ${getRankStyle(
                                  idx
                                )}`}
                              >
                                <span>{getRankEmoji(idx)}</span>
                                <span>#{idx + 1}</span>
                              </div>
                            </td>
                            <td className="p-3 text-white font-bold text-sm tracking-wide">
                              {row.nama.toUpperCase()}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-1 text-xs font-bold ${getMilestoneStyle(row.milestone)}`}
                              >
                                {row.milestone !== "-" ? row.milestone : "N/A"}
                              </span>
                            </td>
                            <td className="p-3 text-center text-base font-bold text-cyan-300">
                              {row.skillPoints.toFixed(1)}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-pink-400">
                              {row.arcadeCount}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-green-400">
                              {row.triviaCount}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-green-400">
                              +{row.bonusPoints}
                            </td>
                            <td className="p-3 text-center text-lg font-bold text-yellow-400">
                              {row.totalPoints % 1 === 0
                                ? row.totalPoints
                                : row.totalPoints.toFixed(1)}
                            </td>
                            <td className="p-3 text-center">
                              <div className={`flex flex-col items-center gap-1 leading-none text-xs font-bold ${
                                getArcadeTier(row.totalPoints).name === 'Legend' ? 'text-yellow-400' :
                                getArcadeTier(row.totalPoints).name === 'Champion' ? 'text-blue-400' :
                                getArcadeTier(row.totalPoints).name === 'Ranger' ? 'text-green-400' :
                                getArcadeTier(row.totalPoints).name === 'Trooper' ? 'text-orange-400' :
                                getArcadeTier(row.totalPoints).name === 'Novice' ? 'text-purple-400' :
                                'text-slate-300'
                              }`}>
                                <span>{getArcadeTier(row.totalPoints).stars}</span>
                                <span>{getArcadeTier(row.totalPoints).name}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Summary rows for total before bonus and total score */}
                      {leaderboard.length > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-yellow-400 bg-black/80">
                            <td className="p-3 text-right font-bold text-yellow-300" colSpan={7}>
                              TOTAL BEFORE BONUS
                            </td>
                            <td className="p-3 text-center text-lg font-bold text-yellow-400">
                              {leaderboard.reduce(
                                (sum, row) => sum + Math.round(row.basePoints),
                                0
                              )}
                            </td>
                            <td className="p-3"></td>
                          </tr>
                          <tr className="border-t border-yellow-400/40 bg-black/80">
                            <td className="p-3 text-right font-bold text-yellow-300" colSpan={7}>
                              TOTAL SCORE
                            </td>
                            <td className="p-3 text-center text-lg font-bold text-yellow-400">
                              {leaderboard.reduce(
                                (sum, row) => sum + Math.round(row.totalPoints),
                                0
                              )}
                            </td>
                            <td className="p-3"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Total Statistics Section */}
            {totalStats && (
              <section className="w-full mt-8">
                <div className="border border-yellow-400/40 bg-black/70 p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
                    &gt; TOTAL BADGE STATISTICS &lt;
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-cyan-900/50 border-2 border-cyan-400 p-4 text-center">
                      <div className="text-2xl font-bold text-cyan-400 mb-2">
                        {totalStats.totalSkillBadges}
                      </div>
                      <div className="text-sm text-cyan-300">
                        SKILL BADGES
                      </div>
                    </div>
                    <div className="bg-pink-900/50 border-2 border-pink-400 p-4 text-center">
                      <div className="text-2xl font-bold text-pink-400 mb-2">
                        {totalStats.totalArcadeBadges}
                      </div>
                      <div className="text-sm text-pink-300">
                        ARCADE BADGES
                      </div>
                    </div>
                    <div className="bg-green-900/50 border-2 border-green-400 p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">
                        {totalStats.totalTriviaBadges}
                      </div>
                      <div className="text-sm text-green-300">
                        TRIVIA BADGES
                      </div>
                    </div>
                    <div className="bg-slate-800 border-2 border-slate-600 p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-2">
                        {totalStats.totalAllBadges}
                      </div>
                      <div className="text-sm text-slate-300">
                        TOTAL BADGES
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Milestone Progress Section */}
            {totalStats && (
              <section className="w-full mt-8">
                <div className="border border-yellow-400/40 bg-black/70 p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-6 text-center">
                    &gt; MILESTONE PROGRESS &lt;
                  </h3>
                  <div className="space-y-4">
                    {/* Milestone 1 */}
                    <div className="border border-yellow-400/40 bg-black/60 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-base font-medium text-yellow-300">
                          Milestone #1 - 350 Badges
                        </h4>
                        <div className="text-sm text-yellow-300 bg-yellow-400/10 px-2 py-1 border border-yellow-400/30">
                          {Math.min(Math.round(((Math.min((totalStats.totalArcadeBadges / 100) * 100, 100) + Math.min((totalStats.totalTriviaBadges / 100) * 100, 100) + Math.min((totalStats.totalSkillBadges / 150) * 100, 100)) / 3)), 100)}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-3">
                        Target: 100 arcade + 100 trivia + 150 skill badges
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Arcade Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalArcadeBadges}/100 ({Math.min(Math.round((totalStats.totalArcadeBadges / 100) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalArcadeBadges / 100) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Trivia Games</span>
                            <span className="text-gray-300">
                              {totalStats.totalTriviaBadges}/100 ({Math.min(Math.round((totalStats.totalTriviaBadges / 100) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalTriviaBadges / 100) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Skill Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalSkillBadges}/150 ({Math.min(Math.round((totalStats.totalSkillBadges / 150) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalSkillBadges / 150) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestone 2 */}
                    <div className="border border-yellow-400/40 bg-black/60 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-base font-medium text-yellow-300">
                          Milestone #2 - 600 Badges
                        </h4>
                        <div className="text-sm text-yellow-300 bg-yellow-400/10 px-2 py-1 border border-yellow-400/30">
                          {Math.min(Math.round(((Math.min((totalStats.totalArcadeBadges / 150) * 100, 100) + Math.min((totalStats.totalTriviaBadges / 150) * 100, 100) + Math.min((totalStats.totalSkillBadges / 300) * 100, 100)) / 3)), 100)}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-3">
                        Target: 150 arcade + 150 trivia + 300 skill badges
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Arcade Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalArcadeBadges}/150 ({Math.min(Math.round((totalStats.totalArcadeBadges / 150) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalArcadeBadges / 150) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Trivia Games</span>
                            <span className="text-gray-300">
                              {totalStats.totalTriviaBadges}/150 ({Math.min(Math.round((totalStats.totalTriviaBadges / 150) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalTriviaBadges / 150) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Skill Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalSkillBadges}/300 ({Math.min(Math.round((totalStats.totalSkillBadges / 300) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalSkillBadges / 300) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestone 3 */}
                    <div className="border border-yellow-400/40 bg-black/60 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-base font-medium text-yellow-300">
                          Milestone #3 - 950 Badges
                        </h4>
                        <div className="text-sm text-yellow-300 bg-yellow-400/10 px-2 py-1 border border-yellow-400/30">
                          {Math.min(Math.round(((Math.min((totalStats.totalArcadeBadges / 250) * 100, 100) + Math.min((totalStats.totalTriviaBadges / 250) * 100, 100) + Math.min((totalStats.totalSkillBadges / 450) * 100, 100)) / 3)), 100)}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-3">
                        Target: 250 arcade + 250 trivia + 450 skill badges
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Arcade Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalArcadeBadges}/250 ({Math.min(Math.round((totalStats.totalArcadeBadges / 250) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalArcadeBadges / 250) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Trivia Games</span>
                            <span className="text-gray-300">
                              {totalStats.totalTriviaBadges}/250 ({Math.min(Math.round((totalStats.totalTriviaBadges / 250) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalTriviaBadges / 250) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Skill Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalSkillBadges}/450 ({Math.min(Math.round((totalStats.totalSkillBadges / 450) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalSkillBadges / 450) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestone 4 */}
                    <div className="border border-yellow-400/40 bg-black/60 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-base font-medium text-yellow-300">
                          Milestone #4 - 1300 Badges
                        </h4>
                        <div className="text-sm text-yellow-300 bg-yellow-400/10 px-2 py-1 border border-yellow-400/30">
                          {Math.min(Math.round(((Math.min((totalStats.totalArcadeBadges / 350) * 100, 100) + Math.min((totalStats.totalTriviaBadges / 350) * 100, 100) + Math.min((totalStats.totalSkillBadges / 600) * 100, 100)) / 3)), 100)}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-3">
                        Target: 350 arcade + 350 trivia + 600 skill badges
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Arcade Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalArcadeBadges}/350 ({Math.min(Math.round((totalStats.totalArcadeBadges / 350) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalArcadeBadges / 350) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Trivia Games</span>
                            <span className="text-gray-300">
                              {totalStats.totalTriviaBadges}/350 ({Math.min(Math.round((totalStats.totalTriviaBadges / 350) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalTriviaBadges / 350) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Skill Badges</span>
                            <span className="text-gray-300">
                              {totalStats.totalSkillBadges}/600 ({Math.min(Math.round((totalStats.totalSkillBadges / 600) * 100), 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                              style={{width: `${Math.min((totalStats.totalSkillBadges / 600) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}