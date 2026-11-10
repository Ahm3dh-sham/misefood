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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian text-parchment antialiased">
        {children}
      </body>
    </html>
  );
}
