import { Geist_Mono, Oxanium } from "next/font/google"

import "@packages/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@packages/ui/components/toast"
import { cn } from "@packages/ui/lib/utils"

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        oxanium.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
