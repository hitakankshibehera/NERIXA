import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store/AppContext";

export const metadata: Metadata = {
  title: "NER-SHIELD AI — Predictive Logistics Intelligence Platform",
  description: "AI-powered predictive logistics and accessibility intelligence platform for India's North Eastern Region. Predict disruptions, protect supply chains, optimize routes, and save response time.",
  keywords: "NER, North East India, logistics, AI, predictive analytics, GIS, supply chain, route optimization",
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
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
