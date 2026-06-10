import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'

const barlow = Barlow_Condensed({
    subsets: ['latin'],
    weight: ['600', '700', '800', '900'],
    variable: '--font-barlow',
})

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'WESHTV',
    description: 'World Cup 2026 · Every match, the right channel, in your timezone.',
    manifest: '/manifest.json',
    icons: { icon: '/favicon.svg', apple: '/icon-192.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
            <body>
                {children}
                <script dangerouslySetInnerHTML={{
                    __html: `
          if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
            })
          }
        `}} />
            </body>
        </html>
    )
}