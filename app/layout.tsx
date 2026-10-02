import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production" ? "https://gelife.netlify.app" : "http://localhost:3000")
  ),
  title: {
    default: "GELife Group | Training, Energy & Business Advisory",
    template: "%s | GELife Group",
  },
  description: "Customized self-paced professional training, energy technical services, and business advisory from GELife Group.",
  keywords: [
    "professional training",
    "energy technical services",
    "business advisory",
    "self-paced professional courses",
    "GELife Group",
  ],
  openGraph: {
    type: "website",
    siteName: "GELife Group",
    title: "GELife Group | Training, Energy & Business Advisory",
    description: "Customized professional training, energy technical services, and business advisory for organizations and professionals.",
    images: [{ url: "/images/business-team.png", alt: "Professionals collaborating on business strategy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GELife Group | Training, Energy & Business Advisory",
    description: "Customized professional training, energy technical services, and business advisory for organizations and professionals.",
    images: ["/images/business-team.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
