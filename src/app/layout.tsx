import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antibiotics Copilot",
  description:
    "AI-powered clinical decision support for antibiotic therapy, dosing, resistance patterns, and stewardship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen antialiased">
      <body className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
