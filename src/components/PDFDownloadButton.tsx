"use client";
import React, { useState, useEffect } from "react";

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

interface PDFDownloadButtonProps {
  data: LeaderboardRow[];
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      // Dynamic import to avoid SSR issues
      const { LeaderboardPDF } = await import("../app/upload/LeaderboardPDF");
      const { pdf } = await import("@react-pdf/renderer");
      
      // Generate PDF blob using JSX element directly
      const blob = await pdf(<LeaderboardPDF data={data} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'arcade-leaderboard.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-yellow-400 text-black font-pixel text-sm p-3 border-2 border-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="bg-yellow-400 text-black font-pixel text-sm p-3 border-2 border-slate-600 hover:bg-yellow-300 disabled:opacity-50"
    >
      {isLoading ? "GENERATING PDF..." : "DOWNLOAD PDF"}
    </button>
  );
};
