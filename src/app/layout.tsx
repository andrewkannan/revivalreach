import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";

import AuthProvider from "@/components/providers/SessionProvider";
import PrayerTicker from "@/components/PrayerTicker";

const inter = Inter({ subsets: ["latin"] });

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
          <TopNav />
          <PrayerTicker />
          <main className="app-container">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
