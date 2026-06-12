import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import AppClientEffects from '@/components/AppClientEffects'

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
        <html
            lang="en"
            suppressHydrationWarning
            className={`${barlow.variable} ${inter.variable}`}
        >
            <head>
                <meta name="color-scheme" content="dark light" />
                <meta name="theme-color" content="#090909" />
            </head>

            <body suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>

                <AppClientEffects />
            </body>
        </html>
    )
}