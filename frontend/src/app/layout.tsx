import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiseFood — AI Sous Chef, Social Recipe Hub & Smart Meal Planner",
  description:
    "Full-stack culinary intelligence powered by Next.js, FastAPI, LangGraph, Google Gemini 3.8, pgvector, and Web Speech API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#ECEEF0] text-zinc-950 antialiased">
        {children}
      </body>
    </html>
  );
}
