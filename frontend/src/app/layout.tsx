import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Lexend_Deca } from 'next/font/google'
import Head from 'next/head'
// const inter = Inter({ subsets: ['latin'] })
const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // optional, choose what you need
})

export const metadata: Metadata = {
  title: 'AI Sales Agents - Dashboard',
  description: '24/7 AI-powered sales automation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        {/* ✅ Load Font Awesome from CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-/j6lq6ecim7HHoXJ7N1eT0n/YMezqq1of7d2X0ZaL9gZstCkA8ykx5VY/8p1/f3+LThRf5p62rXsyvVclHh+DQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body className={lexendDeca.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
