import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoCraft - Inovasi Gamifikasi PBL Algoritma & Pemrograman",
  description:
    "Platform web gamifikasi edukatif berbasis Problem Based Learning (PBL) materi berpikir komputasional dan pemrograman untuk siswa kelas X.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/AN-Logo.png", sizes: "any" },
      { url: "/icon.png" },
    ],
    shortcut: "/AN-Logo.png",
    apple: "/AN-Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/AN-Logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/AN-Logo.png" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
