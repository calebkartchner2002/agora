import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agora",
  description: "Composable commerce orchestration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.20), transparent 55%)," +
            "radial-gradient(900px 500px at 80% 30%, rgba(16,185,129,0.14), transparent 60%)," +
            "linear-gradient(180deg, rgb(var(--bg)) 0%, rgb(5 6 11) 100%)",
        }}
      >
        {/* App container */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 16px 64px",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
