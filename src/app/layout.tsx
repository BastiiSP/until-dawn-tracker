import type { Metadata, Viewport } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel-loaded',
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Until Dawn Tracker',
  description: 'Track your Until Dawn decisions across multiple runs',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Until Dawn',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable} bg-horror-bg text-horror-text antialiased`}>
        {children}
      </body>
    </html>
  )
}
