'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Globe } from 'lucide-react'
import type { Region } from '@/lib/channels'

export default function BottomNav({
    region,
    onRegionToggle,
}: {
    region?: Region
    onRegionToggle?: () => void
}) {
    const path = usePathname()

    return (
        <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: 64,
            background: 'var(--bottom-nav-bg)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 100,
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
            <Link href="/" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: path === '/' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
            }}>
                <Home size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Home
                </span>
            </Link>

            <Link href="/schedule" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: path === '/schedule' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
            }}>
                <Calendar size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Programme
                </span>
            </Link>

            <button
                onClick={onRegionToggle}
                style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none',
                    cursor: onRegionToggle ? 'pointer' : 'default',
                    color: 'var(--text-muted)',
                }}
            >
                <Globe size={20} color={region === 'dz' ? 'var(--accent)' : region === 'no' ? 'var(--text-muted)' : 'var(--text-muted)'} />
                <span style={{
                    fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                }}>
                    {region === 'dz' ? '🇩🇿 DZ' : region === 'no' ? '🇳🇴 NO' : 'Region'}
                </span>
            </button>
        </div>
    )
}