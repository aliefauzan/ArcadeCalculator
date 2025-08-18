# 🎮 Arcade Team Calculator

A powerful Next.js web application designed to process Google Cloud Skills Boost CSV data and generate interactive leaderboards for arcade team. This tool automatically scrapes participant profiles, calculates points based on achievements, and provides beautiful visualizations with PDF export capabilities.

![Arcade Theme](https://img.shields.io/badge/Theme-Retro%20Arcade-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)

## ✨ Features

### 🎯 Core Functionality
- **CSV Upload & Processing**: Upload Google Cloud Skills Boost participant CSV files
- **Multi-file Support**: Process up to 2 CSV files simultaneously
- **Intelligent Data Parsing**: Automatic extraction of participant information and URLs
- **Profile Scraping**: Real-time scraping of Google Cloud Skills Boost profiles
- **Smart Caching**: Efficient caching system to avoid redundant API calls

### 🏆 Leaderboard System
- **Dynamic Scoring**: Automatic calculation of points based on:
  - Skill badges (0.5 points each)
  - Arcade games completed (1 point each)
  - Trivia games completed (1 point each)
  - Milestone bonuses (up to 25 points)
- **Milestone Recognition**: Four achievement levels:
  - 🥇 **ULTIMATE**: Highest tier (pink gradient badge)
  - 🥈 **Level 3**: Galaxy Commander (yellow badge)
  - 🥉 **Level 2**: Space Pilot (purple badge)
  - 🏅 **Level 1**: Cadet (green badge)

### 🎨 Visual Design
- **Retro Arcade Theme**: Pixel-perfect 8-bit inspired design
- **Animated Background**: Dynamic starfield with floating spaceships
- **Pixel Font**: Custom Press Start 2P font for authentic retro feel
- **Color-coded Data**: Intuitive color system for different data types
- **Responsive Design**: Works perfectly on desktop and mobile devices

### 📄 Export Capabilities
- **PDF Generation**: Create professional leaderboard reports
- **Colored PDF Output**: Maintains color schemes in exported documents
- **Custom Branding**: Includes author information and social links
- **Print-ready Format**: Landscape orientation optimized for printing

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/aliefauzan/ArcadeCalculator.git
   cd ArcadeCalculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm run start
```

## 📋 How to Use

### Step 1: Prepare Your CSV Data
- Export participant data from Google Cloud Skills Boost
- Ensure CSV contains the required columns:
  - `Nama Peserta` (Participant Name)
  - `Email Peserta` (Participant Email)
  - `URL Profil Google Cloud Skills Boost` (Profile URL)
  - Other relevant fields for tracking achievements

### Step 2: Upload CSV Files
1. Click on the file upload area
2. Select up to 2 CSV files
3. Choose which files to include in the calculation
4. Wait for processing to complete

### Step 3: View Results
- Automatic leaderboard generation with real-time scoring
- Color-coded milestones and achievement indicators
- Sortable rankings with detailed breakdowns

### Step 4: Export PDF (Optional)
- Click "DOWNLOAD PDF" to generate a printable report
- PDF includes all colors and formatting from the web interface

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15.4.4 with App Router
- **Styling**: Tailwind CSS 4 with custom pixel art components
- **UI Components**: Custom arcade-themed React components
- **PDF Generation**: @react-pdf/renderer with custom styling

### Backend
- **API Routes**: Next.js API routes for serverless functions
- **Data Processing**: CSV parsing with Papa Parse
- **Web Scraping**: Cheerio for profile data extraction
- **Caching**: In-memory caching for performance optimization

### Key Technologies
- **TypeScript**: Full type safety across the application
- **React 19**: Latest React features and optimizations
- **Tailwind CSS**: Utility-first CSS framework
- **Papa Parse**: Robust CSV parsing library
- **Cheerio**: Server-side HTML parsing and scraping

## ☁️ Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aliefauzan/ArcadeCalculator)

1. **Connect your repository** to Vercel
2. **Configure environment variables** (if any)
3. **Deploy** - Vercel will automatically build and deploy your app

### Deploy on Other Platforms

#### Netlify
```bash
npm run build
npm run export  # if using static export
```

#### Railway
```bash
# Use the Railway CLI or connect via GitHub
railway login
railway link
railway up
```

#### AWS/Google Cloud/Azure
Build the application and deploy using your preferred containerization method:

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Add any environment variables here
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Customization

#### Styling
- Modify `src/app/globals.css` for global styles
- Update `tailwind.config.ts` for custom theme configuration
- Edit component styles in individual `.tsx` files

#### Scoring Logic
- Adjust point calculations in `src/app/api/process-leaderboard/route.ts`
- Modify milestone thresholds and bonuses as needed

#### PDF Styling
- Customize PDF appearance in `src/app/upload/LeaderboardPDF.tsx`
- Update colors, fonts, and layout to match your branding

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── process-leaderboard/
│   │   │   └── route.ts          # Main API endpoint for data processing
│   │   └── scrape/
│   │       └── route.ts          # Profile scraping endpoint
│   ├── upload/
│   │   ├── page.tsx              # Main upload interface
│   │   └── LeaderboardPDF.tsx    # PDF generation component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page (redirects to upload)
├── components/
│   └── PDFDownloadButton.tsx     # PDF export functionality
└── public/
    └── fonts/
        └── Press_Start_2P/       # Pixel font files
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Alief Fauzan**
- LinkedIn: [@alief-fauzan1](https://www.linkedin.com/in/alief-fauzan1/)
- GitHub: [@aliefauzan](https://github.com/aliefauzan)

## 🎮 Acknowledgments

- Inspired by retro arcade aesthetics
- Built for Google Cloud Skills Boost community
- Special thanks to the open-source community for the amazing tools and libraries

---

<div align="center">
  <strong>🚀 Ready to calculate some arcade scores? Let's go! 🎮</strong>
</div>
