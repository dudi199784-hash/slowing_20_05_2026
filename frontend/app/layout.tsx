import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

import AuthPresenceCookieSync from "@/components/auth/AuthPresenceCookieSync";
import ChatbotWindy from "@/components/ChatbotWindy";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandSerif = Playfair_Display({
  variable: "--font-brand-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SLOWIND",
  description: "춘춘희",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brandSerif.variable} min-h-screen bg-black text-neutral-900 antialiased`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-[min(100%,120rem)] flex-col bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          <AuthPresenceCookieSync />
          <Header />
          <main className="w-full flex-1">{children}</main>
          <Footer />
        </div>
        <ChatbotWindy />
      </body>
    </html>
  );
}
