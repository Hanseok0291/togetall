import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "트레드밀 페이스",
};

export default function TreadmillPaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
