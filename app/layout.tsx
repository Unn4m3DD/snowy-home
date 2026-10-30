import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Covilhã · Rentals",
  icons: { icon: "/favicon.svg" },
  description:
    "Rental listings with AC photo evidence and driving estimates to Hospital Pêro da Covilhã.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
