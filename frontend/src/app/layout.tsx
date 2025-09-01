import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Lifestyle & Learning Recommender',
  description: 'AI-powered recommendations for workouts, recipes, and learning modules based on your mood, time, and interests',
  keywords: ['lifestyle', 'learning', 'recommendations', 'AI', 'workouts', 'recipes', 'courses'],
  authors: [{ name: 'Smart LLR Team' }],
  metadataBase: new URL('http://localhost:3006'),
  openGraph: {
    title: 'Smart Lifestyle & Learning Recommender',
    description: 'Discover personalized workouts, recipes, and learning modules tailored to your mood and available time',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Lifestyle & Learning Recommender',
    description: 'AI-powered personalized recommendations for a better lifestyle',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
