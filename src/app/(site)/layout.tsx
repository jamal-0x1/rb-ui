import type { Metadata, Viewport } from "next";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import SiteShell from "./SiteShell";
import SiteJsonLd from "./SiteJsonLd";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz"
).replace(/\/$/, "");

const SITE_NAME = "RB Accessories";
const SITE_TAGLINE = "Bangladesh's accessories storefront";
const SITE_DESCRIPTION =
  "Shop phones, watches, audio, peripherals and more. BDT pricing, cash on delivery across Bangladesh.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#3C50E0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <SiteJsonLd />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
