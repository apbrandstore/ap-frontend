import type { Metadata } from "next";
import { Funnel_Sans, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { CsrfInitializer } from "@/components/common/CsrfInitializer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { TrackingScripts } from "@/components/common/TrackingScripts";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AP Brand Store",
  description: "Your premium shopping destination",
  icons: {
    icon: "/media/apbrandstore.jpg",
    shortcut: "/media/apbrandstore.jpg",
    apple: "/media/apbrandstore.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Dynamic Tracking Codes from Django Admin */}
        <TrackingScripts />
        <CsrfInitializer />
        <CartProvider>
          <Suspense fallback={null}>
            <LoadingScreen />
          </Suspense>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <MobileNavigation />
        </CartProvider>
      </body>
    </html>
  );
}
