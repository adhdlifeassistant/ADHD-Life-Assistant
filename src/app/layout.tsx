import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MoodProvider } from "@/modules/mood/MoodContext";
import { ReminderProvider } from "@/modules/reminders/ReminderContext";
import { DashboardProvider } from "@/modules/dashboard/DashboardContext";
import { FinanceProvider } from "@/modules/finance/FinanceContext";
import { CleaningProvider } from "@/modules/cleaning/CleaningContext";
import { HealthProvider } from "@/modules/health/HealthContext";
import { AnalyticsProvider } from "@/modules/analytics/AnalyticsContext";
import ThemeProvider from "@/components/ui/ThemeProvider";
import PWAInstall from "@/components/PWAInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADHD Life Assistant",
  description: "Assistant de vie qui s'adapte à votre humeur et vous aide au quotidien - spécialement conçu pour les personnes ADHD",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ADHD Assistant"
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for screen readers */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Aller au contenu principal
        </a>
        
        {/* Live region for announcements */}
        <div 
          id="live-region" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        ></div>
        
        {/* Status announcements for screen readers */}
        <div 
          id="status-region" 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        ></div>

        <MoodProvider>
          <ReminderProvider>
            <FinanceProvider>
              <CleaningProvider>
                <HealthProvider>
                  <AnalyticsProvider>
                    <DashboardProvider>
                      <ThemeProvider>
                        {children}
                        <PWAInstall />
                      </ThemeProvider>
                    </DashboardProvider>
                  </AnalyticsProvider>
                </HealthProvider>
              </CleaningProvider>
            </FinanceProvider>
          </ReminderProvider>
        </MoodProvider>
      </body>
    </html>
  );
}
