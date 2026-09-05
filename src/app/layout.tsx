import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store/AppContext";

export const metadata: Metadata = {
  title: "NER-SHIELD AI — Predictive Logistics Intelligence Platform",
  description: "AI-powered predictive logistics and accessibility intelligence platform for India's North Eastern Region. Predict disruptions, protect supply chains, optimize routes, and save response time.",
  keywords: "NER, North East India, logistics, AI, predictive analytics, GIS, supply chain, route optimization",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#070a12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
