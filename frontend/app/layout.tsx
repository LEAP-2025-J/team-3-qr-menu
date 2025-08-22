import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Haku QR Menu Orders System",
  description:
    "Modern QR menu system for Japanese restaurants with real-time order management",
  generator: "Haku Restaurant",
  keywords: ["restaurant", "qr-menu", "japanese", "orders", "haku"],
  authors: [{ name: "Haku Restaurant Team" }],
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/admin"
          afterSignUpUrl="/admin"
        >
          <SignedOut>
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <h1 className="text-xl font-semibold text-gray-900">Haku QR Menu</h1>
                <div className="flex items-center gap-4">
                  <Link href="/sign-in">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/sign-up">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </header>
          </SignedOut>
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
