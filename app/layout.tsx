import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

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
        <html lang="en" className={`${barlow.variable} ${inter.variable}`} style={{ colorScheme: 'dark', background: '#090909' }}>
            <head>
                <meta name="color-scheme" content="dark" />
                <meta name="theme-color" content="#090909" />
            </head>
            <body style={{ background: '#090909', color: '#efefef' }}>
                {children}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-WWNHTMHKQV"
                    strategy="afterInteractive"
                />

                <Script
                    id="google-analytics"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WWNHTMHKQV');
        `,
                    }}
                />
                <Script
                    id="register-service-worker"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
            if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(() => console.log('Service Worker registered'))
                        .catch((error) => console.log('Service Worker registration failed:', error))
                })
            }
        `,
                    }}
                />
            </body>
        </html>
    )
}