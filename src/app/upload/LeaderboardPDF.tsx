import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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
    padding: 6,
    fontSize: 8,
    color: "#facc15",
    width: "11%",
    textAlign: "center",
  },
  bodyCell: {
    padding: 6,
    fontSize: 9,
    width: "11%",
    textAlign: "center",
  },
  pilotCell: {
    width: "23%",
    textAlign: "left",
  },
  rankCell: {
    width: "10%",
  },
  scoreCell: {
    color: "#facc15",
  },
});

// Define the type for a single row of leaderboard data.
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
          </View>
          {/* Table Body */}
          {data.map((row, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={[styles.bodyCell, styles.rankCell]}>#{idx + 1}</Text>
              <Text style={[styles.bodyCell, styles.pilotCell]}>
                {row.nama.toUpperCase()}
              </Text>
              <Text style={styles.bodyCell}>
                {row.milestone === "-" ? "N/A" : row.milestone}
              </Text>
              <Text style={styles.bodyCell}>{row.skillPoints.toFixed(1)}</Text>
              <Text style={styles.bodyCell}>{row.arcadeCount}</Text>
              <Text style={styles.bodyCell}>{row.triviaCount}</Text>
              <Text style={styles.bodyCell}>+{row.bonusPoints}</Text>
              <Text style={[styles.bodyCell, styles.scoreCell]}>
                {row.totalPoints.toFixed(1)}
              </Text>
            </View>
          ))}
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
