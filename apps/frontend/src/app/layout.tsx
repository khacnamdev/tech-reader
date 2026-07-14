import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tech Reader - Your Personal Technical Knowledge Base",
  description: "A digital Second Brain for developers. Crawl, translate, extract tech concepts, and save technical content permanently with AI assistance.",
  keywords: ["tech reader", "developer second brain", "translation", "RAG", "technical terminology", "spaced repetition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="h-full bg-slate-950 font-sans text-slate-100 antialiased flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
