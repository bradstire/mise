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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2D5016" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('mise-theme');
                  if (mode === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  // Default to light mode if no preference set
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen transition-colors`}>
        {children}
      </body>
    </html>
  );
}
