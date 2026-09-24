import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import InstallPrompt from "@/components/InstallPrompt";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import LaunchOfferWidget from "@/components/global/LaunchOfferWidget";

export const metadata: Metadata = {
  title: "ShuddhEats — Clean & Healthy Indian Snacks",
  description: "Discover ShuddhEats — air-fried snacks, flavoured makhana, and roasted diet mixes made with clean ingredients and eco-friendly packaging.",
  keywords: "healthy snacks, makhana, air fried chips, diet mix, clean eating, Indian snacks",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#475d2a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <InstallPrompt />
            <main className="w-full flex-1 min-h-screen overflow-y-auto overflow-x-hidden pt-[55px] sm:pt-[65px]">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { background: '#475d2a', color: 'white', fontWeight: '500', borderRadius: '6px' },
                success: { style: { background: '#475d2a', color: 'white' } },
                error: { style: { background: '#991b1b', color: 'white' } },
              }}
            />
            <LaunchOfferWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
