import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import BottomNav from '@/components/BottomNav'
import OfflineBanner from '@/components/OfflineBanner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BuiltUp',
  description: 'Personal workout tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BuiltUp',
    startupImage: [
      // iPhone 15 Pro Max / 14 Pro Max (430x932 @3x)
      {
        url: '/splash/apple-splash-1290-2796.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 15 Pro / 14 Pro (393x852 @3x)
      {
        url: '/splash/apple-splash-1179-2556.png',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 14 Plus / 13 Pro Max (428x926 @3x)
      {
        url: '/splash/apple-splash-1284-2778.png',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 14 / 13 / 12 (390x844 @3x)
      {
        url: '/splash/apple-splash-1170-2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone SE 3rd gen (375x667 @2x)
      {
        url: '/splash/apple-splash-750-1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <div
          className="max-w-md mx-auto min-h-screen relative"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </div>
        <OfflineBanner />
        <BottomNav />
      </body>
    </html>
  )
}
