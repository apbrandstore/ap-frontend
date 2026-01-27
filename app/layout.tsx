import type { Metadata } from "next";
import { Funnel_Sans, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { CsrfInitializer } from "@/components/CsrfInitializer";
import { MobileNavigation } from "@/components/MobileNavigation";
import { LoadingScreen } from "@/components/LoadingScreen";

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
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '250317046451659');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=250317046451659&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
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
