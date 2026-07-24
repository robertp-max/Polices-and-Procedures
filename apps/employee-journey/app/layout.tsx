import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Journey | Care Indeed",
  description: "Your personal Care Indeed employee training and onboarding journey.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
