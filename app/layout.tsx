import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SnackProvider } from "./SnackProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar",
  description: "Shared calendar with push reminders",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calendar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-200">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calendar" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#06b6d4" />
      </head>
      <body className={inter.className}>
        <SnackProvider>
          {children}
        </SnackProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
