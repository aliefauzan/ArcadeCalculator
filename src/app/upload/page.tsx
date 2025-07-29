"use client";
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

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
    <svg width="60" height="60" viewBox="0 0 60 60" className="absolute top-16 right-24 opacity-70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" fill="#E0E0E0"/>
        <rect x="10" y="10" width="40" height="40" fill="#C0C0C0"/>
        <rect x="20" y="20" width="20" height="20" fill="#E0E0E0"/>
        <rect x="10" y="25" width="5" height="10" fill="#A0A0A0"/>
        <rect x="40" y="15" width="10" height="10" fill="#A0A0A0"/>
        <rect x="25" y="40" width="15" height="5" fill="#A0A0A0"/>
    </svg>
);

// A component for a pixelated SVG spaceship
const PixelSpaceship = ({ className }: { className?: string }) => (
    <svg width="48" height="48" viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="4" width="8" height="4" fill="#B0B0B0"/>
        <rect x="16" y="8" width="16" height="4" fill="#DCDCDC"/>
        <rect x="12" y="12" width="24" height="16" fill="#F0F0F0"/>
        <rect x="16" y="28" width="16" height="4" fill="#DCDCDC"/>
        <rect x="8" y="16" width="4" height="8" fill="#B0B0B0"/>
        <rect x="36" y="16" width="4" height="8" fill="#B0B0B0"/>
        <rect x="16" y="32" width="4" height="8" fill="#FFC107"/>
        <rect x="28" y="32" width="4" height="8" fill="#FFC107"/>
        <rect x="20" y="36" width="8" height="8" fill="#FF9800"/>
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
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState<{id: number; left: string; top: string; animationDelay: string; size: string}[]>([]);

  // useEffect to generate stars only on the client-side to prevent hydration errors.
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


  // Handles the file upload event.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 2) {
      setError('You can only upload up to 2 CSV files.');
      return;
    }

    setLoading(true);
    setError(null);
    setLeaderboard([]);

    // Parse all files and combine their data
    const parsePromises = Array.from(files).map(file => {
      return new Promise<CsvRow[]>((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<CsvRow>) => {
            if (results.errors.length) {
              reject('CSV parsing error: ' + results.errors[0].message);
            } else {
              resolve(results.data);
            }
          },
        });
      });
    });

    Promise.all(parsePromises)
      .then(async (allData) => {
        const combinedRows = allData.flat();
        setCsvRows(combinedRows);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        // Compute leaderboard data.
        const leaderboardData = combinedRows.map((row) => {
          const skillCount = parseInt(row["# Jumlah Skill Badge yang Diselesaikan"], 10) || 0;
          const arcadeCount = parseInt(row["# Jumlah Game Arcade yang Diselesaikan"], 10) || 0;
          const triviaCount = parseInt(row["# Jumlah Game Trivia yang Diselesaikan"], 10) || 0;

          const arcadePoints = arcadeCount + triviaCount + (skillCount * 0.5);
          let milestoneName = "";
          let bonusPoints = 0;

          if (arcadeCount >= 10 && triviaCount >= 8 && skillCount >= 44) {
            milestoneName = "ULTIMATE MASTER";
            bonusPoints = 25;
          } else if (arcadeCount >= 8 && triviaCount >= 7 && skillCount >= 30) {
            milestoneName = "GALAXY COMMANDER";
            bonusPoints = 15;
          } else if (arcadeCount >= 6 && triviaCount >= 6 && skillCount >= 20) {
            milestoneName = "SPACE PILOT";
            bonusPoints = 10;
          } else if (arcadeCount >= 4 && triviaCount >= 4 && skillCount >= 10) {
            milestoneName = "CADET";
            bonusPoints = 5;
          }

          const totalPoints = arcadePoints + bonusPoints;
          return {
            nama: row["Nama Peserta"],
            arcadePoints,
            bonusPoints,
            totalPoints,
            milestone: milestoneName || "-",
            skillCount,
            arcadeCount,
            triviaCount,
          };
        });

        leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaderboard(leaderboardData);
        setLoading(false);
      })
      .catch((err) => {
        setError(typeof err === 'string' ? err : 'CSV parsing error');
        setLoading(false);
      });
  };

  // Determines the styling for the top 3 ranks.
  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-400 text-black border-2 border-yellow-500";
    if (index === 1) return "bg-slate-300 text-black border-2 border-slate-400";
    if (index === 2) return "bg-orange-400 text-black border-2 border-orange-500";
    return "bg-slate-700 text-white border-2 border-slate-500";
  };

  // Assigns an emoji to the top 3 ranks.
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
            </header>

            {/* Upload Section */}
            <section className="bg-black/50 border-2 border-slate-500 p-6 mb-8">
               <label htmlFor="file-upload" className="text-yellow-400 mb-3 block text-base">
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
              <div className="border-2 border-yellow-400 text-yellow-400 p-6 mb-8 flex items-center justify-center gap-4">
                <span className="text-lg animate-pulse">&gt; PROCESSING...</span>
              </div>
            )}

            {/* Leaderboard Table */}
            {leaderboard.length > 0 && (
              <section className="w-full mt-4">
                <div className="border-2 border-slate-500 bg-black/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-500">
                          <th className="p-3 text-left text-yellow-300 tracking-wider">RANK</th>
                          <th className="p-3 text-left text-yellow-300 tracking-wider">PILOT</th>
                          <th className="p-3 text-left text-yellow-300 tracking-wider">MILESTONE</th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">SKILL</th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">ARCADE</th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">TRIVIA</th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">BONUS</th>
                          <th className="p-3 text-center text-yellow-300 tracking-wider">SCORE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="p-3 font-bold">
                              <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs ${getRankStyle(idx)}`}>
                                <span>{getRankEmoji(idx)}</span>
                                <span>#{idx + 1}</span>
                              </div>
                            </td>
                            <td className="p-3 text-white font-bold text-sm tracking-wide">
                              {row.nama.toUpperCase()}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs font-bold ${
                                row.milestone === 'ULTIMATE MASTER'  ? 'bg-yellow-400 text-black'  
                                : row.milestone === 'GALAXY COMMANDER' ? 'bg-purple-500 text-white'
                                : row.milestone === 'SPACE PILOT' ? 'bg-blue-500 text-white'
                                : row.milestone === 'CADET' ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-300'
                              }`}>
                                {row.milestone !== '-' ? row.milestone : 'N/A'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-base font-bold text-cyan-300">
                                {String(row.skillCount).padStart(2, '0')}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-pink-400">
                                {String(row.arcadeCount).padStart(2, '0')}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-green-400">
                                {String(row.triviaCount).padStart(2, '0')}
                            </td>
                            <td className="p-3 text-center text-base font-bold text-green-400">
                                +{String(row.bonusPoints).padStart(2, '0')}
                            </td>
                            <td className="p-3 text-center text-lg font-bold text-yellow-400">
                                {String(Math.round(row.totalPoints)).padStart(3, '0')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
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
