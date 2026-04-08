import type { Metadata } from "next";
import { Funnel_Sans, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchStorePublic } from "@/lib/server-api";
import { CartProvider } from "@/contexts/CartContext";
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

/** Layout must run per-request so store contact/footer data is not frozen at build time. */
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storePublic = await fetchStorePublic();

  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Dynamic Tracking Codes from Django Admin */}
        <TrackingScripts />
        <CartProvider>
          <LoadingScreen />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer storePublic={storePublic} />
          <MobileNavigation />
        </CartProvider>
      </body>
    </html>
  );
}
