import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = { title: "GAS26 Quiz" };

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <img src="/gas26.png" alt="GNOME.Asia Summit 2026" width={983} height={393} />
        </header>
        {children}
      </body>
    </html>
  );
}
