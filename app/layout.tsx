import type { Metadata } from "next";
import Script from "next/script";
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
  title: "Walka tv",
  description: "WalkaTV es un canal de streaming y entretenimiento...",
  icons: {
    icon: [
      { url: "/favicon1.png" }, // Asegúrate que mida al menos 32x32
      { url: "/favicon1.png", sizes: "192x192", type: "image/png" }, // Para Android/Google
    ],
    apple: [
      { url: "/favicon1.png" }, // Para iPhones
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9545098007455156"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
