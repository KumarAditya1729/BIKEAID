import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MechConnect Mechanic",
  description: "Mechanic partner job workflow."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
