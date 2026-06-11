'use client'

import { REGIONS, type Region } from '@/lib/channels'
import ThemeToggle from '@/components/ThemeToggle'
import type { ReactNode } from 'react'

type NavbarProps = {
    region: Region
    source: 'mock' | 'api'
    loading: boolean
    onRegionChange: (region: Region) => void
    leftContent?: ReactNode
}

export default function Navbar({
    region,
    source,
    loading,
    onRegionChange,
    leftContent,
}: NavbarProps) {
    return (
        <nav
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                height: 52,
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(10px)',
                zIndex: 50,
                gap: 8,
            }}
        >
            {/*  <span
                style={{
                    fontWeight: 900,
                    fontSize: 17,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-barlow)',
                    flexShrink: 0,
                    color: 'var(--logo-text)',
                }}
            >
                WESH<span style={{ color: 'var(--accent)' }}>TV</span>{' '}
                <span
                    style={{
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        verticalAlign: 'middle',
                        color: source === 'api' ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                >
                    {loading ? '...' : source === 'api' ? '● LIVE' : '● MOCK'}
                </span>
            </span> */}
            {leftContent ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        minWidth: 0,
                    }}
                >
                    {leftContent}
                </div>
            ) : (
                <span
                    style={{
                        fontWeight: 900,
                        fontSize: 17,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-barlow)',
                        flexShrink: 0,
                        color: 'var(--logo-text)',
                    }}
                >
                    WESH<span style={{ color: 'var(--accent)' }}>TV</span>{' '}
                    <span
                        style={{
                            fontSize: 9,
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            verticalAlign: 'middle',
                            color: source === 'api' ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                    >
                        {loading ? '...' : source === 'api' ? '● LIVE' : '● MOCK'}
                    </span>
                </span>
            )}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(
                    ([key, r]) => (
                        <button
                            key={key}
                            onClick={() => onRegionChange(key)}
                            style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 500,
                                border:
                                    region === key
                                        ? '1px solid var(--accent-mid)'
                                        : '1px solid var(--border)',
                                background:
                                    region === key
                                        ? 'var(--accent-dim)'
                                        : 'var(--nav-button-bg)',
                                color:
                                    region === key
                                        ? 'var(--accent)'
                                        : 'var(--text-muted)',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {r.flag} {r.region}
                        </button>
                    )
                )}

                <ThemeToggle />
            </div>
        </nav>
    )
}