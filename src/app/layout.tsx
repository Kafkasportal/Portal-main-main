import { AuthInitializer } from '@/components/layout/auth-initializer'
import { ProgressBar } from '@/components/layout/progress-bar'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { WebVitals } from './web-vitals'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Kafkasder Yönetim Paneli',
    template: '%s | Kafkasder',
  },
  description:
    'Kafkas Göçmenleri Derneği Yönetim Sistemi - Bağış, Üye ve Sosyal Yardım Yönetimi',
  keywords: [
    'dernek',
    'yönetim',
    'bağış',
    'sosyal yardım',
    'kafkasder',
    'üye takip',
  ],
  authors: [{ name: 'Kafkasder' }],
  creator: 'Kafkasder',
  publisher: 'Kafkasder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'Kafkasder Yönetim Paneli',
    description: 'Kafkas Göçmenleri Derneği Yönetim Sistemi',
    type: 'website',
    locale: 'tr_TR',
  },
  robots: {
    index: false, // Dashboard sayfaları indexlenmemeli
    follow: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitals />
        <QueryProvider>
          <ProgressBar />
          <AuthInitializer />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  )
}
