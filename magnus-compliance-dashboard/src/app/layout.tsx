import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Magnus Compliance Consulting",
  description: "AI-powered compliance intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <Header />
        <main className="ml-64 mt-16 min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
