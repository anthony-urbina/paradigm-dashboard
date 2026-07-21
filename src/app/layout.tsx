import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Paradigm Financial | Agent Portal",
  description: "Life insurance agent dashboard",
  icons: {
    icon: "/favicon-logo.png",
    apple: "/favicon-logo.png",
  },
  openGraph: {
    title: "Paradigm Financial | Agent Portal",
    description: "Life insurance agent dashboard",
    siteName: "Paradigm Financial",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paradigm Financial | Agent Portal",
    description: "Life insurance agent dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
