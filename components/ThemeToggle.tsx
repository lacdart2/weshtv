'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')

    useEffect(() => {
        const saved = localStorage.getItem('weshtv-theme') as 'dark' | 'light' | null
        const initialTheme = saved ?? 'dark'

        setTheme(initialTheme)
        document.documentElement.setAttribute('data-theme', initialTheme)
    }, [])

    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark'

        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('weshtv-theme', next)
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
            }}
        >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    )
}