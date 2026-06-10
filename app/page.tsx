'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, type Region } from '@/lib/channels'
import { getDayLabel, getFullDateLabel, todayStr } from '@/lib/utils'
import { filterByDate, getUniqueDates } from '@/lib/api'
import NextFeaturedBanner from '@/components/NextFeaturedBanner'
import InstallBanner from '@/components/InstallBanner'
import MatchCard from '@/components/MatchCard'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import ShareAppButton from '@/components/ShareAppButton'
import { Share } from 'next/font/google'

const WORLD_CUP_START = '2026-06-11'

function useMatches() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'mock' | 'api'>('mock')

    useEffect(() => {
        let cancelled = false

        fetch('/api/matches')
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setMatches(data.matches ?? MOCK_MATCHES)
                    setSource(data.source)
                }
            })
            .catch(() => {
                if (!cancelled) setMatches(MOCK_MATCHES)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return { matches, loading, source }
}

function detectRegionByTimezone(): Region {
    if (typeof window === 'undefined') return 'dz'

    const savedRegion = localStorage.getItem('weshtv-region') as Region | null

    if (savedRegion && REGIONS[savedRegion]) {
        return savedRegion
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (timezone === 'Europe/Oslo') return 'no'
    if (timezone === 'Africa/Algiers') return 'dz'
    if (timezone === 'Africa/Tunis') return 'tn'
    if (timezone === 'Africa/Casablanca') return 'ma'

    return 'dz'
}

export default function Home() {
    const { matches: allMatches, loading, source } = useMatches()
    const [region, setRegion] = useState<Region>('dz')
    const [selectedDate, setSelectedDate] = useState<string>('')

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const detectedRegion = detectRegionByTimezone()
            setRegion(detectedRegion)
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const dates = useMemo(() => getUniqueDates(allMatches), [allMatches])
    const today = todayStr()

    const selectedDateResolved = useMemo(() => {
        if (selectedDate) return selectedDate
        return dates.find((d) => d >= WORLD_CUP_START) ?? dates[0] ?? ''
    }, [selectedDate, dates])

    const matches = useMemo(
        () => filterByDate(allMatches, selectedDateResolved),
        [allMatches, selectedDateResolved]
    )

    const liveCount = useMemo(
        () =>
            allMatches.filter(
                (m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'
            ).length,
        [allMatches]
    )

    function handleRegionChange(nextRegion: Region) {
        setRegion(nextRegion)
        localStorage.setItem('weshtv-region', nextRegion)
    }

    function toggleRegion() {
        setRegion((currentRegion) => {
            const nextRegion = currentRegion === 'dz' ? 'no' : 'dz'
            localStorage.setItem('weshtv-region', nextRegion)
            return nextRegion
        })
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
            {/* NAV */}
            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    height: 52,
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(9,9,9,0.94)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 50,
                }}
            >
                <span
                    style={{
                        fontWeight: 900,
                        fontSize: 17,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-barlow)',
                    }}
                >
                    WESH<span style={{ color: 'var(--accent)' }}>TV</span>{' '}
                    <span
                        style={{
                            fontSize: 9,
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            verticalAlign: 'middle',
                            color: source === 'api' ? 'var(--accent)' : '#444',
                        }}
                    >
                        {loading ? '...' : source === 'api' ? '● LIVE' : '● MOCK'}
                    </span>
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                    {(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(
                        ([key, r]) => (
                            <button
                                key={key}
                                onClick={() => handleRegionChange(key)}
                                style={{
                                    padding: '5px 11px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    border:
                                        region === key
                                            ? '1px solid rgba(46,204,113,0.4)'
                                            : '1px solid var(--border)',
                                    background:
                                        region === key
                                            ? 'var(--accent-dim)'
                                            : 'transparent',
                                    color: region === key ? 'var(--accent)' : '#666',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {r.flag} {r.region}
                            </button>
                        )
                    )}
                </div>
            </nav>

            {/* BREATHING ROOM */}
            <div style={{ height: 8 }} />

            {/* BANNER */}
            {!loading && (
                <NextFeaturedBanner
                    matches={allMatches}
                    region={region}
                    onJump={setSelectedDate}
                />
            )}

            {/* HERO */}
            <div
                style={{
                    padding: '24px 20px 22px',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 30%',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(9,9,9,0.91)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div
                        style={{
                            position: 'absolute',
                            right: -40,
                            top: -40,
                            width: 220,
                            height: 220,
                            borderRadius: '50%',
                            border: '1px solid rgba(46,204,113,0.06)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: 10,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            border: '1px solid rgba(46,204,113,0.04)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 18,
                                height: 1,
                                background: 'var(--accent)',
                            }}
                        />

                        <span
                            style={{
                                fontSize: 9,
                                color: 'var(--accent)',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            FIFA World Cup 2026
                        </span>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <div
                            style={{
                                fontFamily: 'var(--font-barlow)',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                lineHeight: 0.9,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 'clamp(38px, 7vw, 64px)',
                                    color: 'var(--text)',
                                    display: 'inline',
                                }}
                            >
                                Wesh,{' '}
                            </span>

                            <span
                                style={{
                                    fontSize: 'clamp(14px, 2vw, 20px)',
                                    display: 'inline',
                                    fontFamily: 'var(--font-inter)',
                                    fontWeight: 300,
                                    letterSpacing: '0.01em',
                                    color: '#555',
                                    textTransform: 'none',
                                }}
                            >
                                c&apos;est sur quelle{' '}
                                <span
                                    style={{
                                        fontFamily: 'var(--font-barlow)',
                                        fontWeight: 900,
                                        /*  fontSize: 'clamp(22px, 4vw, 38px)', */
                                        fontSize: 'clamp(18px, 3vw, 28px)',
                                        color: 'var(--accent)',
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    chaîne
                                </span>{' '}
                                et à quelle{' '}
                                <span
                                    style={{
                                        fontFamily: 'var(--font-barlow)',
                                        fontWeight: 900,
                                        fontSize: 'clamp(18px, 3vw, 28px)',
                                        color: 'var(--accent)',
                                        opacity: 0.55,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    heure?
                                </span>
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            flexWrap: 'wrap',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: '#888',
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            48 teams · 104 matches · Jun 11 – Jul 19
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                            {['🇺🇸', '🇨🇦', '🇲🇽'].map((flag) => (
                                <span key={flag} style={{ fontSize: 14 }}>
                                    {flag}
                                </span>
                            ))}
                        </div>
                        <ShareAppButton />
                    </div>
                </div>
            </div>

            {/* REST OF PAGE */}
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {/* STATS */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        borderBottom: '1px solid var(--border)',
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    {[
                        { n: '48', label: 'Teams', accent: false },
                        { n: '104', label: 'Matches', accent: false },
                        {
                            n: String(liveCount),
                            label: 'Live now',
                            accent: liveCount > 0,
                        },
                        { n: String(matches.length), label: 'Today', accent: false },
                    ].map(({ n, label, accent }, i, arr) => (
                        <div
                            key={label}
                            style={{
                                padding: '16px 16px',
                                borderRight:
                                    i < arr.length - 1
                                        ? '1px solid var(--border)'
                                        : 'none',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 26,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    marginBottom: 4,
                                    color: accent ? 'var(--accent)' : 'var(--text)',
                                    fontVariantNumeric: 'tabular-nums',
                                    fontFamily: 'var(--font-barlow)',
                                }}
                            >
                                {n}
                            </div>

                            <div
                                style={{
                                    fontSize: 10,
                                    color: '#666',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                }}
                            >
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* DATE STRIP */}
                <div
                    style={{
                        display: 'flex',
                        gap: 4,
                        padding: '10px 20px',
                        borderBottom: '1px solid var(--border)',
                        overflowX: 'auto',
                    }}
                >
                    {dates.map((d) => {
                        const { weekday, day } = getDayLabel(d)
                        const active = d === selectedDateResolved
                        const isToday = d === today

                        return (
                            <button
                                key={d}
                                onClick={() => setSelectedDate(d)}
                                style={{
                                    flexShrink: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: active
                                        ? '1px solid rgba(46,204,113,0.35)'
                                        : '1px solid transparent',
                                    background: active
                                        ? 'var(--accent-dim)'
                                        : 'transparent',
                                    color: active ? 'var(--accent)' : '#555',
                                    transition: 'all 0.15s',
                                    minWidth: 46,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    {weekday}
                                </span>

                                <span
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {day}
                                </span>

                                {isToday && (
                                    <span
                                        style={{
                                            width: 3,
                                            height: 3,
                                            borderRadius: '50%',
                                            marginTop: 2,
                                            background: active
                                                ? 'var(--accent)'
                                                : '#444',
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* MATCHES */}
                <div style={{ padding: '16px 20px' }}>
                    <p
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#555',
                            marginBottom: 12,
                        }}
                    >
                        {getFullDateLabel(selectedDateResolved)} · {matches.length}{' '}
                        {matches.length === 1 ? 'match' : 'matches'}
                    </p>

                    {loading && (
                        <div
                            style={{
                                padding: '40px 0',
                                textAlign: 'center',
                                color: '#444',
                                fontSize: 13,
                            }}
                        >
                            Loading matches...
                        </div>
                    )}

                    {!loading && matches.length === 0 && (
                        <div
                            style={{
                                padding: '60px 0',
                                textAlign: 'center',
                                color: '#444',
                                fontSize: 14,
                            }}
                        >
                            No matches scheduled this day.
                        </div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                        }}
                    >
                        {matches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                region={region}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ height: 120 }} />
                <div style={{ paddingBottom: 52 }}>
                    <Footer />
                </div>
            </div>

            <BottomNav region={region} onRegionToggle={toggleRegion} />
            <InstallBanner />
        </div>
    )
}