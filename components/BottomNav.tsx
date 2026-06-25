'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, LayoutGrid, Trophy } from 'lucide-react'


export default function BottomNav() {
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

            <Link href="/groups" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: path === '/groups' || path === '/bracket' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
            }}>
                <LayoutGrid size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Groupes
                </span>
            </Link>
            <Link href="/phases" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                textDecoration: 'none',
                color: path === '/phases' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s',
            }}>
                <Trophy size={20} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Phases
                </span>
            </Link>
        </div>
    )
}