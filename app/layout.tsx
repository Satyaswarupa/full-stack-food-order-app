import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { SocketProvider } from '@/contexts/socket-context'
import './globals.css'

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto'
})

export const metadata: Metadata = {
  title: 'OrderFlow - Food Ordering Made Simple',
  description: 'Order delicious food with real-time tracking',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              {children}
              <Toaster richColors position="top-right" />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
