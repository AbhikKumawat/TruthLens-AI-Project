import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruthLens AI | Media Authenticity & Deepfake Trust Platform",
  description: "Enterprise grade AI Trust Platform for detecting synthetic media, identifying deepfakes, and ensuring video authenticity for creators, moderators, and platforms.",
  keywords: ["Deepfake Detection", "AI Trust Platform", "Synthetic Media", "Video Authenticity", "Enterprise Safety"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background-dark text-slate-100`}
      >
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-sm tracking-tighter">TL</span>
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200">
                TruthLens <span className="text-accent font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-accent/10">AI</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Platform
              </Link>
              <Link
                href="/portal"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                User Portal
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Enterprise Dashboard
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/portal"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                Analyze Video
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              &copy; {new Date().getFullYear()} TruthLens AI Inc. All rights reserved. Protect Media Authenticity.
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-300">Documentation</Link>
              <Link href="#" className="hover:text-slate-300">Support</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
