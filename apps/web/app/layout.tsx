import type { Metadata } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";

const pashtoFont = Noto_Naskh_Arabic({
  variable: "--font-pashto",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SehatYar | صحت یار",
  description:
    "Pashto health literacy assistant — curated FAQs and medicine pack help. Information only, not a doctor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ps" dir="rtl" className={`${pashtoFont.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
