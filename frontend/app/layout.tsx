import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ConditionalHeader from '@/components/ui/ConditionalHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AdjustFlow - Project Management & CRM',
  description: 'Project Management and Customer Relations Management software',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ConditionalHeader />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}