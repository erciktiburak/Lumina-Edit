import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Lumina-Edit",
  description: "Privacy-first browser-native video and image processing studio",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.svg"
  },
  openGraph: {
    title: "Lumina-Edit",
    description: "Open-source, no-server, browser-native editing engine",
    images: ["/og"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
