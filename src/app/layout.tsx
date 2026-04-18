import type { Metadata } from "next";
import { Funnel_Sans, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchStorePublic } from "@/lib/server-api";
import { CartProvider } from "@/contexts/CartContext";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { MetaPixel } from "@/components/analytics/MetaPixel";

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
  title: {
    default: "AP Brand Store",
    template: "%s | AP Brand Store",
  },
  description: "Your premium shopping destination",
};

/** Layout must run per-request so store contact/footer data is not frozen at build time. */
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storePublic = await fetchStorePublic();
  const trackerScriptSrc =
    storePublic?.tracker_script_src?.trim() ||
    (storePublic?.tracker_build_id?.trim()
      ? `https://storage.paperbase.me/static/tracker.js?v=${encodeURIComponent(
          storePublic.tracker_build_id.trim()
        )}`
      : process.env.NODE_ENV !== "production"
        ? "https://storage.paperbase.me/static/tracker.js"
        : "");

  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <CartProvider>
          <MetaPixel trackerScriptSrc={trackerScriptSrc} />
          <LoadingScreen />
          <Navbar storePublic={storePublic} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer storePublic={storePublic} />
          <MobileNavigation storePublic={storePublic} />
        </CartProvider>
      </body>
    </html>
  );
}
