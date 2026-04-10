import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'PlaceIQ — AI-Powered Placement Intelligence',
  description: 'Transforming campus placements with AI-powered analytics, smart matching, and autonomous decision-making for Training & Placement Cells.',
  keywords: 'placement, AI, dashboard, TPC, campus recruitment, analytics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
