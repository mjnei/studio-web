import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { PwaRegistration } from "@/components/pwa/pwa-registration";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n";
import { AmbientBackground } from "@/components/shell/ambient-background";
import { AmbientBackgroundProvider } from "@/lib/ambient-background";
import {
  AMBIENT_BACKGROUND_COOKIE,
  parseAmbientBackgroundStyle,
} from "@/lib/ambient-background-shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

export const metadata: Metadata = {
  title: "Huavoi Studio",
  description: "AI-assisted video production — Source to Script to Voice to Final Cut",
  metadataBase,
  applicationName: "Huavoi Studio",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Huavoi Studio",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "Huavoi Studio",
    description: "AI-assisted video production — Source to Script to Voice to Final Cut",
    type: "website",
    siteName: "Huavoi Studio",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Huavoi Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Huavoi Studio",
    description: "AI-assisted video production — Source to Script to Voice to Final Cut",
    images: ["/og-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0e17",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const ambientStyle = parseAmbientBackgroundStyle(
    cookieStore.get(AMBIENT_BACKGROUND_COOKIE)?.value
  );

  return (
    <html
      lang="en"
      data-ambient-bg={ambientStyle}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh text-text-primary">
        <AmbientBackgroundProvider initialStyle={ambientStyle}>
          <AmbientBackground />
          <I18nProvider>
            <ToastProvider position="top-right" maxToasts={5}>
              <AuthProvider>
                <NotificationProvider>
                  <PwaRegistration />
                  {children}
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </I18nProvider>
        </AmbientBackgroundProvider>
      </body>
    </html>
  );
}
