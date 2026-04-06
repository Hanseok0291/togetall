import type { Metadata, Viewport } from "next";

import { getMetadataBase } from "@/lib/site";

import "./globals.css";

const title = "Treadmill Pace";
const description =
  "목표 러닝 페이스(/km)를 표준 트레드밀 속도(km/h)로 빠르게 변환합니다. 기기 표시와 약간 다를 수 있어요.";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: title,
    template: `%s · ${title}`,
  },
  description,
  applicationName: title,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ko_KR",
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
