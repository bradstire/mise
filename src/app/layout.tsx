import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://mise-eight.vercel.app'),
  title: "Mise — Recipe to Grocery List",
  description: "Paste a recipe, get a shopping list. Everything in its place.",
  keywords: ["recipe", "grocery", "shopping list", "meal prep", "cooking", "ingredients", "meal planning"],
  authors: [{ name: "Mise" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mise",
  },
  openGraph: {
    title: "Mise — Recipe to Grocery List",
    description: "Paste a recipe, get a shopping list. No signup, no typing. Just paste and go.",
    type: "website",
    siteName: "Mise",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mise - Paste a recipe, get a shopping list",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mise — Recipe to Grocery List",
    description: "Paste a recipe, get a shopping list. No signup, no typing. Just paste and go.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2D5016",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
