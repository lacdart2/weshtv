'use client'

import { ReactNode, useLayoutEffect } from 'react'

export default function ThemeProvider({ children }: { children: ReactNode }) {
    useLayoutEffect(() => {
        try {
            const savedTheme = localStorage.getItem('weshtv-theme') || 'dark'
            document.documentElement.setAttribute('data-theme', savedTheme)
        } catch {
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }, [])

    return <>{children}</>
}