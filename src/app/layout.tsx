import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Sistem Pengajuan Izin - PT Globallink Smart IT Solution",
  description: "Aplikasi pembuatan dan persetujuan formulir pengajuan izin karyawan dengan template PDF resmi.",
  icons: {
    icon: "/logo-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
