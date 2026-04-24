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
  title: "Lab Companion — Understand Your Lab Results",
  description:
    "Upload your lab results and understand every number — privately, instantly, for free. Plain-language explanations, doctor visit prep, and 30+ biomarkers explained. Nothing leaves your browser.",
  keywords: [
    "lab results",
    "understand lab results",
    "health literacy",
    "medical education",
    "privacy-first",
    "MedGemma",
    "lab companion",
    "biomarkers explained",
    "doctor visit prep",
  ],
  authors: [{ name: "Krista Reed" }],
  openGraph: {
    title: "Lab Companion — Understand Your Lab Results",
    description:
      "Understand your lab results in plain language. Prepare for your doctor visit. 100% private — nothing leaves your browser.",
    url: "https://labcompanion.app",
    siteName: "Lab Companion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lab Companion — Understand Your Lab Results",
    description:
      "Privacy-first lab results education. 30+ biomarkers explained. Nothing leaves your browser.",
  },
  metadataBase: new URL("https://labcompanion.app"),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lab Companion",
  url: "https://labcompanion.app",
  description:
    "A privacy-first browser-based application that explains lab results in plain language, generates doctor visit questions, and explains 30+ biomarkers — with zero data transmission.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Krista Reed",
    url: "https://ditdigitallabs.com",
  },
  featureList: [
    "Local OCR processing — no uploads",
    "30+ biomarkers explained",
    "Doctor visit question generation",
    "Plain-language explanations",
    "PDF export",
    "Works offline",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is my health data sent to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Lab Companion processes everything locally in your browser using client-side OCR. Your lab results are never transmitted to any server — not even ours.",
      },
    },
    {
      "@type": "Question",
      name: "What lab formats does Lab Companion support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lab Companion supports PDF and image uploads from most major lab providers including Quest Diagnostics, LabCorp, hospital patient portals, and international lab formats.",
      },
    },
    {
      "@type": "Question",
      name: "How many biomarkers does Lab Companion explain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lab Companion explains 30+ biomarkers across 7 categories including cardiovascular, metabolic, kidney function, liver, thyroid, blood health, and nutrients.",
      },
    },
    {
      "@type": "Question",
      name: "Is Lab Companion a substitute for medical advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Lab Companion is an educational tool that explains what lab markers mean at a population level. It does not diagnose conditions, prescribe treatments, or replace the advice of a healthcare provider.",
      },
    },
    {
      "@type": "Question",
      name: "Does Lab Companion require an account or subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Lab Companion is completely free to use and requires no account, email address, or sign-up. Open the app, upload your results, and understand them.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Lab Companion offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once the app is loaded in your browser, it runs without an internet connection. All processing is local.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}