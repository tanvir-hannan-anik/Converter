import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Converter — PDF Toolkit",
  description: "Convert, merge, compress, and edit PDFs instantly in your browser. Fast, private, and free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 min-h-screen text-slate-900 flex flex-col font-[family-name:var(--font-inter)] antialiased">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Converter"
                  width={32}
                  height={32}
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800 hidden sm:block">
                Converter
              </span>
            </Link>

            {/* Nav */}
            <NavBar />
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Converter</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              All files are processed locally — nothing leaves your device.
            </span>
          </div>
        </footer>

      </body>
    </html>
  );
}
