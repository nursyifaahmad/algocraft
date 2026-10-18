import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoCraft - Inovasi Gamifikasi PBL Algoritma & Pemrograman",
  description:
    "Platform web gamifikasi edukatif berbasis Problem Based Learning (PBL) materi berpikir komputasional dan pemrograman untuk siswa kelas X.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
