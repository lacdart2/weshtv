import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'WESHTV',
    description: 'World Cup 2026 · Every match, the right channel, in your timezone.',
    icons: {
        icon: '/favicon.svg',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}