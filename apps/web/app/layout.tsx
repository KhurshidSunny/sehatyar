import type { Metadata } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";

import AppChrome from "@/components/AppChrome";
import "./globals.css";

const pashtoFont = Noto_Naskh_Arabic({
  variable: "--font-pashto",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SehatYar | صحت یار",
  description:
    "Pashto and English health literacy assistant — curated FAQs and medicine pack help. Information only, not a doctor.",
  applicationName: "SehatYar",
  themeColor: "#0f766e",
  appleWebApp: {
    capable: true,
    title: "SehatYar",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ps"
      dir="rtl"
      translate="no"
      className={`${pashtoFont.variable} notranslate h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
