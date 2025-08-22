import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Haku QR Menu Orders System",
  description: "Admin sign-up page for Haku restaurant management system",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
