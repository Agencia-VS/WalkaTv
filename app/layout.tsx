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
  metadataBase: new URL("https://walkatv.com"),
  title: {
    default: "Walka TV — Entretenimiento y deporte",
    template: "%s",
  },
  description:
    "Walka TV es un medio de entretenimiento y deporte: reviews, entrevistas, análisis y detrás de cámaras de nuestro canal de YouTube.",
  applicationName: "Walka TV",
  keywords: [
    "Walka TV",
    "entretenimiento deportivo",
    "entrevistas deportivas",
    "reviews",
    "análisis deportivo",
    "YouTube deporte",
  ],
  authors: [{ name: "Equipo Walka TV" }],
  creator: "Walka TV",
  publisher: "Walka TV",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://walkatv.com",
    siteName: "Walka TV",
    title: "Walka TV — Entretenimiento y deporte",
    description:
      "Reviews, entrevistas, análisis y detrás de cámaras del equipo de Walka TV.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Walka TV",
    description:
      "Reviews, entrevistas, análisis y detrás de cámaras del equipo de Walka TV.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon1.png" },
      { url: "/favicon1.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicon1.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
