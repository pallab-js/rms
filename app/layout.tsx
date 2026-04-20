import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const circularFont = localFont({
  src: [
    { path: "../public/fonts/DM_Sans-Regular.woff2", weight: "400" },
    { path: "../public/fonts/DM_Sans-Medium.woff2", weight: "500" },
  ],
  variable: "--font-sans",
});

const sourceCodePro = localFont({
  src: "../public/fonts/SourceCodePro-Regular.woff2",
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RestaurantOS",
  description: "Professional Offline Restaurant Management System",
};

import DbProvider from "@/components/shared/DbProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
      lang="en"
      className={`${circularFont.variable} ${sourceCodePro.variable} h-full antialiased dark`}
    >
      <body className="h-full flex overflow-hidden bg-background text-foreground">
        <DbProvider>
          <TooltipProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-base/30">
                {children}
              </main>
            </div>
            <Toaster position="top-right" closeButton richColors />
          </TooltipProvider>
        </DbProvider>
      </body>
    </html>
  );
}
