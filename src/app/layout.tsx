import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MoodSort — AI Mood Playlists for Spotify",
  description:
    "MoodSort connects to your Spotify library, analyzes your liked songs using AI, and organizes them into coherent mood-based playlists — then keeps them updated as your taste evolves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full bg-[#F5F4F0] text-[#121212]">{children}</body>
    </html>
  );
}
