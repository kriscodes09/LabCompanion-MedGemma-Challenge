import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Lab Results Literacy Companion",
  description: "Privacy-first lab results education. Understand your lab results and prepare for doctor visits. 100% local processing - your health data never leaves your device.",
  keywords: ["lab results", "health literacy", "medical education", "privacy-first", "MedGemma"],
  authors: [{ name: "Krista Reed" }],
  openGraph: {
    title: "Lab Results Literacy Companion",
    description: "Understand your lab results. Prepare for doctor visits. 100% private and local.",
    url: "https://labcompanion.netlify.app",
    siteName: "Lab Results Literacy Companion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lab Results Literacy Companion",
    description: "Privacy-first lab results education powered by MedGemma",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
