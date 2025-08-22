import type { Metadata } from "next";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Admin - Haku QR Menu Orders System",
  description:
    "Admin dashboard for managing restaurant orders, menu, and tables, reservations",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
