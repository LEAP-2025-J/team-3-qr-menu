import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Codes - Haku QR Menu Orders System",
  description: "Generate and manage QR codes for restaurant tables",
};

export default function QRCodesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
