import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";

import AuthProvider from "@/components/providers/SessionProvider";
import PrayerTicker from "@/components/PrayerTicker";

const inter = Inter({ subsets: ["latin"] });

import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

export const metadata: Metadata = {
  title: "Revival Reach",
  description: "Event and evangelism management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PreferencesProvider>
            <LanguageProvider>
              <TopNav />
              <PrayerTicker />
              <main className="app-container">
                {children}
              </main>
              <BottomNav />
            </LanguageProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
