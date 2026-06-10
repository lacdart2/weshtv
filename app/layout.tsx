import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'WESHTV',
    description: 'World Cup 2026 · Every match, the right channel, in your timezone.',
    manifest: '/manifest.json',
    icons: { icon: '/favicon.svg', apple: '/icon-192.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
                <script dangerouslySetInnerHTML={{
                    __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
            })
          }
        `}} />
            </body>
        </html>
    )
}