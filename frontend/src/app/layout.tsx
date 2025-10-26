import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Lexend_Deca } from 'next/font/google'

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
      <body className={lexendDeca.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
