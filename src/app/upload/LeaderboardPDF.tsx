import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { LeaderboardRow } from "../../utils/cache-manager";

// Register the local font file.
// The path is absolute from the `public` directory.
Font.register({
  family: "Press Start 2P",
  src: "/fonts/Press_Start_2P/PressStart2P-Regular.ttf",
});

// Define styles for the PDF document, mimicking the website's theme.
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0d112a",
    color: "white",
    fontFamily: "Press Start 2P",
    padding: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#facc15", // Tailwind's yellow-400
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937", // Tailwind's gray-800
    borderBottomWidth: 2,
    borderBottomColor: "#facc15",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#4b5563", // Tailwind's gray-600
  },
  headerCell: {
    padding: 4,
    fontSize: 8,
    color: "#facc15",
    width: "9%",
    textAlign: "center",
  },
  bodyCell: {
    padding: 4,
    fontSize: 8,
    width: "9%",
    textAlign: "center",
    color: "white", // Default white color
  },
  pilotCell: {
    width: "27%",
    textAlign: "left",
  },
  rankCell: {
    width: "10%",
  },
  scoreCell: {
    color: "#facc15",
  },
  // Milestone color styles
  ultimateMilestone: {
    color: "#ec4899", // Pink for ULTIMATE
    fontWeight: "bold",
  },
  milestone3: {
    color: "#facc15", // Yellow for level 3
    fontWeight: "bold",
  },
  milestone2: {
    color: "#a855f7", // Purple for level 2
    fontWeight: "bold",
  },
  milestone1: {
    color: "#22c55e", // Green for level 1
    fontWeight: "bold",
  },
  milestoneNA: {
    color: "#94a3b8", // Gray for N/A
  },
  // Arcade Tier color styles based on main page
  tierLegend: {
    color: "#facc15", // yellow-400
    fontWeight: "bold",
  },
  tierChampion: {
    color: "#60a5fa", // blue-400
    fontWeight: "bold",
  },
  tierRanger: {
    color: "#4ade80", // green-400
    fontWeight: "bold",
  },
  tierTrooper: {
    color: "#fb923c", // orange-400
    fontWeight: "bold",
  },
  tierNovice: {
    color: "#c084fc", // purple-400
    fontWeight: "bold",
  },
  tierUnranked: {
    color: "#d1d5db", // slate-300
  },
  // Other column colors
  skillCell: {
    color: "#06b6d4", // Cyan for skill points
  },
  arcadeCell: {
    color: "#f472b6", // Pink for arcade count
  },
  triviaCell: {
    color: "#22c55e", // Green for trivia count
  },
  bonusCell: {
    color: "#22c55e", // Green for bonus points
  },
  baseCell: {
    color: "#3b82f6", // Blue for base points
  },
});

// Helper function to get milestone style based on value
const getMilestoneStyle = (milestone: string) => {
  if (milestone === "ULTIMATE") return styles.ultimateMilestone;
  if (milestone === "3") return styles.milestone3;
  if (milestone === "2") return styles.milestone2;
  if (milestone === "1") return styles.milestone1;
  return styles.milestoneNA;
};

// Helper function to get arcade tier style based on value
const getArcadeTier = (points: number) => {
  if (points >= 95) return { name: "Legend", stars: "★★★★★" };
  if (points >= 75) return { name: "Champion", stars: "★★★★" };
  if (points >= 65) return { name: "Ranger", stars: "★★★" };
  if (points >= 45) return { name: "Trooper", stars: "★★" };
  if (points >= 25) return { name: "Novice", stars: "★" };
  return { name: "Unranked", stars: "" };
};

const getArcadeTierStyle = (tier: string) => {
  if (tier === "Legend") return styles.tierLegend;
  if (tier === "Champion") return styles.tierChampion;
  if (tier === "Ranger") return styles.tierRanger;
  if (tier === "Trooper") return styles.tierTrooper;
  if (tier === "Novice") return styles.tierNovice;
  if (tier === "Unranked") return styles.tierUnranked;
  return styles.milestoneNA; // Fallback for N/A or other values
};

// The PDF Document Component
export const LeaderboardPDF = ({ data }: { data: LeaderboardRow[] }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>THE ARCADE</Text>
          <Text style={styles.subtitle}>LEADERBOARD</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.rankCell]}>RANK</Text>
            <Text style={[styles.headerCell, styles.pilotCell]}>PILOT</Text>
            <Text style={styles.headerCell}>MILESTONE</Text>
            <Text style={styles.headerCell}>SKILL</Text>
            <Text style={styles.headerCell}>ARCADE</Text>
            <Text style={styles.headerCell}>TRIVIA</Text>
            <Text style={styles.headerCell}>BONUS</Text>
            <Text style={styles.headerCell}>SCORE</Text>
            <Text style={styles.headerCell}>ARCADE TIER</Text>
          </View>
          {/* Table Body */}
          {data.map((row, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={[styles.bodyCell, styles.rankCell]}>#{idx + 1}</Text>
              <Text style={[styles.bodyCell, styles.pilotCell]}>
                {row.nama.toUpperCase()}
              </Text>
              <Text style={{
                ...styles.bodyCell,
                ...getMilestoneStyle(row.milestone)
              }}>
                {row.milestone === "-" ? "N/A" : row.milestone}
              </Text>
              <Text style={{
                ...styles.bodyCell,
                ...styles.skillCell
              }}>{(row.skillCount * 0.5).toFixed(1)}</Text>
              <Text style={{
                ...styles.bodyCell,
                ...styles.arcadeCell
              }}>{row.arcadeCount}</Text>
              <Text style={{
                ...styles.bodyCell,
                ...styles.triviaCell
              }}>{row.triviaCount}</Text>
              <Text style={{
                ...styles.bodyCell,
                ...styles.bonusCell
              }}>+{row.bonusPoints}</Text>
              <Text style={{
                ...styles.bodyCell,
                ...styles.scoreCell
              }}>
                {row.totalPoints.toFixed(1)}
              </Text>
              <Text style={{
                ...styles.bodyCell,
                ...getArcadeTierStyle(getArcadeTier(row.totalPoints).name)
              }}>
                    {/* Gold stars for Arcade Tier, on separate line */}
                    {getArcadeTier(row.totalPoints).stars && (
                      <Text style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold' }}>
                        {getArcadeTier(row.totalPoints).stars}
                      </Text>
                    )}
                    {"\n"}
                    <Text>
                      {getArcadeTier(row.totalPoints).name && getArcadeTier(row.totalPoints).name !== "Unranked"
                        ? getArcadeTier(row.totalPoints).name
                        : "N/A"}
                    </Text>
              </Text>
            </View>
          ))}
          {/* Total Before Bonus row */}
          <View style={[styles.tableRow, { borderTopWidth: 2, borderTopColor: '#3b82f6', borderBottomWidth: 0, backgroundColor: '#000000' }]}>
            <Text style={[styles.bodyCell, { width: '82%', paddingRight: 12, textAlign: 'right', fontWeight: 'bold', color: '#3b82f6' }]}>
              TOTAL BEFORE BONUS
            </Text>
            <Text style={[styles.bodyCell, { width: '9%', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }]}>
              {data.reduce((sum, row) => sum + row.basePoints, 0).toFixed(1)}
            </Text>
            <Text style={[styles.bodyCell, { width: '9%' }]}></Text>
          </View>
          {/* Total Score row */}
          <View style={[styles.tableRow, { borderTopWidth: 0, borderBottomWidth: 0, backgroundColor: '#000000' }]}>
            <Text style={[styles.bodyCell, { width: '82%', paddingRight: 12, textAlign: 'right', fontWeight: 'bold', color: '#fbbf24' }]}>
              TOTAL SCORE
            </Text>
            <Text style={[styles.bodyCell, { width: '9%', textAlign: 'center', fontWeight: 'bold', color: '#fbbf24' }]}>
              {data.reduce((sum, row) => sum + row.totalPoints, 0).toFixed(1)}
            </Text>
            <Text style={[styles.bodyCell, { width: '9%' }]}></Text>
          </View>
        </View>
        {/* Author credit and LinkedIn logo/button */}
        <View
          style={{
            marginTop: 24,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10, color: "#facc15", marginRight: 8 }}>
            by aliefauzan
          </Text>
          {/* LinkedIn SVG icon */}
          <View style={{ width: 16, height: 16, marginRight: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="4" fill="#0A66C2" />
              <path
                d="M4.75 6.5H6.25V11.25H4.75V6.5ZM5.5 5.75C5.91421 5.75 6.25 5.41421 6.25 5C6.25 4.58579 5.91421 4.25 5.5 4.25C5.08579 4.25 4.75 4.58579 4.75 5C4.75 5.41421 5.08579 5.75 5.5 5.75ZM7.25 8.25C7.25 7.69772 7.69772 7.25 8.25 7.25C8.80228 7.25 9.25 7.69772 9.25 8.25V11.25H10.75V8.25C10.75 7.14543 9.85457 6.25 8.75 6.25C7.64543 6.25 6.75 7.14543 6.75 8.25V11.25H8.25V8.25Z"
                fill="white"
              />
            </svg>
          </View>
          <Text
            style={{
              fontSize: 10,
              color: "#0A66C2",
              textDecoration: "underline",
            }}
          >
            https://www.linkedin.com/in/alief-fauzan1/
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);
