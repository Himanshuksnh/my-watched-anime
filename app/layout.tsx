import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk"
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains"
})

export const metadata: Metadata = {
  title: "Anime Collection - Modern Anime Listing Website",
  description: "Discover and manage your favorite anime collection with our modern, responsive website.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0b0d17' }}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
