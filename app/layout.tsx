import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const font = localFont({
  src: "./fonts/GeistVF.woff",
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "POS App",
  description: "Sistema Operacional Pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${font.className} bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
