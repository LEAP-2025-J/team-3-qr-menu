import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Haku QR Menu Orders System",
  description: "Admin sign-in page for Haku restaurant management system",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
