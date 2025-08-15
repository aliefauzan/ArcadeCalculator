"use client";
import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { LeaderboardPDF } from "../app/upload/LeaderboardPDF";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      // Use a function to create the document to avoid React 19 issues
      const createDoc = () => <LeaderboardPDF data={data} />;
      const pdfBlob = await pdf(createDoc()).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
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
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="bg-yellow-400 text-black font-pixel text-sm p-3 border-2 border-slate-600 hover:bg-yellow-300 disabled:opacity-50"
    >
      {isGenerating ? "LOADING PDF..." : "DOWNLOAD PDF"}
    </button>
  );
};
