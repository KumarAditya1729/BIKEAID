import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MechConnect Customer",
  description: "Request roadside assistance and home bike service."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
