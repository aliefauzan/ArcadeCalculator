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
    totalPoints: number;
    milestone: string;
    skillCount: number;
    arcadeCount: number;
    triviaCount: number;
  };
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState<
    {
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      size: string;
    }[]
  >([]);

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
    if (files.length > 2) {
      setError("You can only upload up to 2 CSV files.");
      return;
    }

    setLoading(true);
    setError(null);
    setLeaderboard([]);

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
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
        updateLeaderboard(
          allFiles,
          allFiles.map((_, idx) => idx)
        );
      })
      .catch((err) => {
        setError(typeof err === "string" ? err : "CSV parsing error");
        setLoading(false);
      });
  };

  const updateLeaderboard = async (
    files: { name: string; data: CsvRow[] }[],
    selected: number[]
  ) => {
    // The backend now handles all date filtering, so we can combine rows directly.
    const combinedRows = selected.flatMap(idx => files[idx]?.data || []);
    
    setLoading(true);
    // Use the combined rows directly
    const csvText = Papa.unparse(combinedRows);

    async function fetchLeaderboard(retries = 2): Promise<any[] | null> {
      for (let attempt = 0; attempt <= retries; attempt++) {
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
          if (attempt === retries) return null;
          await new Promise((resolve) => setTimeout(resolve, 1200)); // Wait before retry
        }
      }
      return null;
    }

    const leaderboardData = await fetchLeaderboard(2);
    if (leaderboardData && leaderboardData.leaderboard) {
      setLeaderboard(
        leaderboardData.leaderboard.map((row: any) => {
          let milestoneNum = "-";
          if (row.milestone === "ULTIMATE MASTER") milestoneNum = "3";
          else if (row.milestone === "GALAXY COMMANDER") milestoneNum = "2";
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
            totalPoints: row.totalPoints,
            milestone: milestoneNum,
            skillCount: row.skillCount,
            arcadeCount: row.arcadeCount,
            triviaCount: row.triviaCount,
          };
        })
      );
      setError(null);
    } else {
      setError(
        "Failed to process leaderboard after several attempts. Please try again."
      );
      setLeaderboard([]);
    }
    setLoading(false);
  };

  const handleCheckboxChange = (idx: number) => {
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

        <div className="relative z-10 flex flex-col items-center justify-start p-4 sm:p-8 min-h-screen">
          <div className="w-full max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <header className="text-center mb-12 py-4">
              <h1 className="text-4xl sm:text-5xl mb-2 text-yellow-400 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
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
                      className="flex items-center gap-2 text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(idx)}
                        onChange={() => handleCheckboxChange(idx)}
                        className="accent-yellow-400 w-4 h-4"
                      />
                      <span>{file.name}</span>
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

                <div className="border-2 border-slate-500 bg-black/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-500">
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
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-700 hover:bg-slate-700/50"
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
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 text-xs font-bold ${
                                  row.milestone === "3"
                                    ? "bg-yellow-400 text-black"
                                    : row.milestone === "2"
                                    ? "bg-purple-500 text-white"
                                    : row.milestone === "1"
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-700 text-slate-300"
                                }`}
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
                          </tr>
                        ))}
                      </tbody>
                      {/* Summary row for total score */}
                      {leaderboard.length > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-yellow-400 bg-black/80">
                            <td
                              colSpan={7}
                              className="p-3 text-right font-bold text-yellow-300"
                            >
                              TOTAL SCORE
                            </td>
                            <td className="p-3 text-center text-lg font-bold text-yellow-400">
                              {leaderboard.reduce(
                                (sum, row) => sum + Math.round(row.totalPoints),
                                0
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
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