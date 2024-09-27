import "@/styles/globals.css"

import { Metadata } from "next"
import { Viewport } from "next/types"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

const iconUrl =
  "https://raw.githubusercontent.com/aliasesapp/dreamstack-images/main/images/favicon"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: `${iconUrl}/favicon-16x16.png`, sizes: "16x16" },
      { url: `${iconUrl}/favicon-32x32.png`, sizes: "32x32" },
    ],
    shortcut: `${iconUrl}/favicon-16x16.png`,
    apple: `${iconUrl}/apple-touch-icon.png`,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#050A1A" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
