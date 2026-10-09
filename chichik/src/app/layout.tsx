import type { Metadata } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin", "cyrillic"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Чичик — подготовка к ОГЭ и ЕГЭ",
  description:
    "Теория, практика, диагностика слабых тем, банк ошибок и пробники для ОГЭ и ЕГЭ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${literata.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
