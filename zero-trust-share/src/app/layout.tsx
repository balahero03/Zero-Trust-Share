import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/Layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AetherVault - Zero-Trust File Sharing",
  description: "The only file-sharing platform that combines a user-managed, zero-knowledge architecture with true out-of-band, two-factor authentication for every file you share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-text-primary`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
