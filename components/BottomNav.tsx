'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Globe } from 'lucide-react'
import type { Region } from '@/lib/channels'

export default function BottomNav({
    region,
    onRegionToggle,
}: {
    region: Region
    onRegionToggle: () => void
}) {
    const path = usePathname()
    const isHome = path === '/'

    return (
        <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: 64,
            background: 'rgba(9,9,9,0.96)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 100,
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>

            {/* Home */}
            <Link href="/" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: isHome ? 'var(--accent)' : '#555',
                transition: 'color 0.15s',
            }}>
                <Home size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Home
                </span>
            </Link>

            {/* Today shortcut — scrolls date strip to today */}
            <Link href="/schedule" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: '#555',
                transition: 'color 0.15s',
            }}>
                <Calendar size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Schedule
                </span>
            </Link>

            {/* Region toggle */}
            <button
                onClick={onRegionToggle}
                style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none',
                    cursor: 'pointer',
                    color: '#555',
                }}
            >
                <Globe size={20} color={region === 'dz' ? '#2ecc71' : '#888'} />
                <span style={{
                    fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#555',
                }}>
                    {region === 'dz' ? '🇩🇿 DZ' : '🇳🇴 NO'}
                </span>
            </button>

        </div>
    )
}