import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis or database)
const botLastVisit = new Map<string, number>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
  const userAgent = request.headers.get('user-agent') || '';
  const now = Date.now();
  const path = request.nextUrl.pathname;
  
  // Check if it's a bot
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  if (isBot) {
    console.log(`🤖 BOT DETECTED: ${userAgent.substring(0, 50)} from ${ip}`);
    
    const botKey = `${ip}-${userAgent.substring(0, 50)}`; // Use IP + partial UA as key
    const lastVisit = botLastVisit.get(botKey);
    const sixHoursMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    
    if (lastVisit && (now - lastVisit) < sixHoursMs) {
      // Bot visited within last 6 hours, block the request
      const timeRemaining = Math.ceil((sixHoursMs - (now - lastVisit)) / (60 * 1000)); // Minutes remaining
      console.log(`Bot blocked: ${userAgent.substring(0, 50)} from ${ip}. Try again in ${timeRemaining} minutes.`);
      
      return new NextResponse(
        `Bot access limited to once every 6 hours. Please try again in ${timeRemaining} minutes.`,
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((sixHoursMs - (now - lastVisit)) / 1000)), // Seconds to wait
            'X-Bot-Policy': 'Analysis allowed every 6 hours'
          }
        }
      );
    }
    
    // Allow the bot and record this visit
    botLastVisit.set(botKey, now);
    console.log(`✅ BOT ALLOWED: ${userAgent.substring(0, 50)} from ${ip} for 6-hour analysis window.`);
  } else {
    // Log human users (optional - remove if too verbose)
    console.log(`👤 HUMAN USER: ${path} from ${ip}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
