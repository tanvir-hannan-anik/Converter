import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Converter - Advanced PDF Manager",
  description: "Convert, edit, and merge PDFs locally and securely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900 flex flex-col`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group w-full md:w-auto justify-center md:justify-start">
              <Image 
                src="/logo.png" 
                alt="Converter Logo" 
                width={36} 
                height={36} 
                className="group-hover:scale-105 transition-transform object-contain" 
              />
              <span className="font-bold text-2xl tracking-tight text-slate-800">Converter</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600 w-full md:w-auto">
              <Link href="/convert" className="hover:text-blue-600 transition">Image to PDF</Link>
              <Link href="/merge" className="hover:text-blue-600 transition">Merge</Link>
              <Link href="/edit" className="hover:text-blue-600 transition">Edit</Link>
              <Link href="/pdf-to-doc" className="hover:text-blue-600 transition">PDF to DOC</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
