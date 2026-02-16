import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "Crow Voice Layer",
  description: "Voice command interface for Crow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <script 
  src="https://api.usecrow.org/static/crow-widget.js"
  data-api-url="https://api.usecrow.org"
  data-product-id="user_38yg9kLxItMv8GyFH4xNMZytg6F"
  data-agent-name="Assistant"
></script>
      </body>
    </html>
  );
}
