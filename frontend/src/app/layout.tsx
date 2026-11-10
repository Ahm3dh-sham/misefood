import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiseFood — Katori-Native Recipe Studio, Parallel Meal Prep & Voice Chef",
  description:
    "Import recipes from links, Reels, or handwritten cards into 150ml Indian katori and gram measurements, coordinate multi-dish parallel cooking timelines, and plan weekly thalis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f1f3e6] text-[#000000] antialiased selection:bg-[#3f6212] selection:text-[#fcfcfd]">
        {children}
      </body>
    </html>
  );
}
