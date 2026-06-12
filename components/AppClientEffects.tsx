'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        dataLayer: unknown[]
    }
}

export default function AppClientEffects() {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-WWNHTMHKQV'
        script.async = true
        document.head.appendChild(script)

        window.dataLayer = window.dataLayer || []

        function gtag(...args: unknown[]) {
            window.dataLayer.push(args)
        }

        gtag('js', new Date())
        gtag('config', 'G-WWNHTMHKQV')
    }, [])

    useEffect(() => {
        if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then(() => console.log('Service Worker registered'))
                    .catch((error) =>
                        console.log('Service Worker registration failed:', error)
                    )
            })
        }
    }, [])

    return null
}