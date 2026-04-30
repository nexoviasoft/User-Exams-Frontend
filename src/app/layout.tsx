import type { Metadata } from "next";
import { Manjari } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const manjari = Manjari({
  subsets: ["latin"],
  weight: ["100", "400", "700"],
  variable: "--font-manjari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PolyExamBuzz - Modern Exam System",
  description: "A subscription-based exam system for students and teachers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${manjari.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
