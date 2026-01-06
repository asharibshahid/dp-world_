import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AuthGate from "../components/AuthGate";
import MobileShell from "../components/MobileShell";
import SplashGate from "../components/SplashGate";
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
  title: "DP World Mobile Prototype",
  description: "Static mobile UI prototype for DP World operations.",
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
        <ClerkProvider>
          <SplashGate>
            <MobileShell>
              <AuthGate>{children}</AuthGate>
            </MobileShell>
          </SplashGate>
        </ClerkProvider>
      </body>
    </html>
  );
}
