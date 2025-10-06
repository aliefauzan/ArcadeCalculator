# 🎮 Arcade Team Calculator

**🌐 Live Demo**: [https://arcade-calculator-280204705798.asia-southeast2.run.app/upload](https://arcade-calculator-280204705798.asia-southeast2.run.app/upload)

![Arcade Theme](https://img.shields.io/badge/Theme-Retro%20Arcade-yellow) ![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black) ![React](https://img.shields.io/badge/React-19.1.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

A Next.js web application with **micro-service architecture** that processes Google Cloud Skills Boost CSV data and generates interactive leaderboards with retro arcade aesthetics.

## ✨ Key Features

- **🏗️ Micro-Service Architecture**: Modular design with 6 utility services for optimal maintainability
- **⚡ High-Performance Processing**: ~15-25 seconds for 115 participants with parallel batch processing
- **🎯 Smart Competition Logic**: Dual scoring system with competition period filtering (July 15 - September 16, 2025)
- **🎨 Retro Design**: Pixel-perfect 8-bit aesthetic with animated backgrounds and custom fonts
- **📄 Professional PDF Export**: High-quality colored reports with full formatting preservation
- **🔄 Smart Caching**: SHA256-based caching with 45-minute TTL for improved performance
- **🛡️ Enhanced Error Handling**: Graceful handling of private profiles (403/404 errors)

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/aliefauzan/ArcadeCalculator.git
cd ArcadeCalculator
npm install

# Start development
npm run dev
# Visit http://localhost:3000
```

## 🏗️ Architecture

### Project Structure
```
src/
├── app/
│   ├── api/process-leaderboard/route.ts  # Main processing endpoint
│   ├── api/scrape/route.ts              # Profile scraping
│   └── upload/                          # UI components
└── utils/                               # Micro-services
    ├── cache-manager.ts                 # SHA256 caching + TTL
    ├── profile-scraper.ts               # Badge scraping orchestration
    ├── badge-classifier.ts              # Date filtering + badge classification
    ├── fetch-utils.ts                   # Smart retry + exponential backoff
    ├── scoring.ts                       # Point calculation + milestones
    └── skill-badges.ts                  # 93 skill badge database
```

### Data Flow
```
CSV Upload → Parsing → Profile Scraping → Badge Classification → Scoring → Leaderboard Display
     ↓           ↓            ↓                   ↓               ↓             ↓
Cache Check → Validation → Batch Processing → Competition Filter → Milestones → PDF Export
```

## 🎯 Competition System

### Scoring Rules
- **Skill badges**: 0.5 points each
- **Extra badges**: 2 points each  
- **Arcade games**: 1 point each
- **Trivia games**: 1 point each
- **Milestone bonuses**: Up to 28 points

### Competition Period *(Completed)*
- **Period**: July 15 - September 16, 2025
- **Logic**: All badges count for base points, only competition-period badges counted for milestones
- **Milestones**: 🥇 ULTIMATE → 🥈 Level 3 → 🥉 Level 2 → 🏅 Level 1

## 📡 API Endpoints

### Process CSV Data
```http
POST /api/process-leaderboard
Content-Type: text/csv or multipart/form-data

Response:
{
  "cacheStatus": "HIT|MISS",
  "cacheExpiresIn": "45 minutes",
  "leaderboard": [...],
  "totalStats": {...}
}
```

### Individual Profile Scraping
```http
POST /api/scrape
Content-Type: application/json
Body: {"url": "profile-url"}
```

## 🐳 Deployment

### Docker
```bash
docker build -t arcade-calculator .
docker run -p 3000:3000 arcade-calculator
```

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aliefauzan/ArcadeCalculator)

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/arcade-calculator
gcloud run deploy --image gcr.io/PROJECT_ID/arcade-calculator --allow-unauthenticated
```

## 🛠️ Configuration

### CSV Requirements
- `Nama Peserta`: Participant name
- `Email Peserta`: Participant email  
- `URL Profil Google Cloud Skills Boost`: Profile URL

### Environment Variables
Auto-generated build timestamps:
- `BUILD_DATE`, `BUILD_VERSION`, `BUILD_TIME` (updated on each build)

## 🔧 Development

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## 📈 Performance

| Metric | Performance |
|--------|-------------|
| **Processing Time** | ~15-25 seconds (115 participants) |
| **Batch Size** | 20 participants (optimized) |
| **Network Efficiency** | 80% fewer requests with smart image logic |
| **Caching** | 45-minute TTL with SHA256 hashing |

## 🎨 Tech Stack

- **Frontend**: Next.js 15.4.4, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Papa Parse, Cheerio
- **PDF**: @react-pdf/renderer
- **Deploy**: Docker, Vercel, Google Cloud

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Alief Fauzan**
- 🌐 [LinkedIn](https://www.linkedin.com/in/alief-fauzan1/)
- 🐙 [GitHub](https://github.com/aliefauzan)

---

*A powerful, performance-optimized tool for managing Google Cloud Skills Boost competitions with retro arcade style!* 🎮