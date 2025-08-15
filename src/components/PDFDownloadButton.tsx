"use client";
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
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
  return (
    <PDFDownloadLink
      document={<LeaderboardPDF data={data} />}
      fileName="arcade-leaderboard.pdf"
      className="bg-yellow-400 text-black font-pixel text-sm p-3 border-2 border-slate-600 hover:bg-yellow-300"
    >
      {({ loading }) => (loading ? "LOADING PDF..." : "DOWNLOAD PDF")}
    </PDFDownloadLink>
  );
};
