import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import { directionOf } from "@/i18n/config";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale, getServerDictionary } from "@/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kufi = Noto_Kufi_Arabic({
  variable: "--font-kufi",
  subsets: ["arabic"],
  weight: ["600", "700"],
});

// Body text in Arabic (and any Arabic the founder types in the English interface).
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/** The public web address, for full links in shared previews (set NEXT_PUBLIC_SITE_URL when hosted). */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  // The preview image itself comes from opengraph-image.png / twitter-image.png in this folder.
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      type: "website",
      siteName: "KHITTA | خِطّة",
      title: t.meta.title,
      description: t.meta.description,
      locale: t.locale === "ar" ? "ar_AE" : "en_AE",
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    // Font variables sit on <html> so the theme's font stacks (defined at :root) can use them.
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${kufi.variable} ${plexArabic.variable}`}
    >
      <body className="font-sans antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
