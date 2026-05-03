import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

function cleanEnv(value: string | undefined, fallback = "") {
  if (!value) return fallback;
  return value.trim().replace(/^"|"$/g, "");
}

const appName = cleanEnv(process.env.NEXT_PUBLIC_APP_NAME, "Pick.UP");
const appUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL, "https://pickuphone.com");

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "AI voice receptionist for every small business",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: appName,
    description: "AI voice receptionist for every small business",
    url: appUrl,
    siteName: appName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: "AI voice receptionist for every small business",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
