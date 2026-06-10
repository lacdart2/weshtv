import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'WESHTV',
    description: 'World Cup 2026 · Every match, the right channel, in your timezone.',
    manifest: '/manifest.json',
    icons: { icon: '/favicon.svg', apple: '/icon-192.png' },
    themeColor: '#090909',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'WESHTV',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}