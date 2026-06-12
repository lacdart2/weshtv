'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, type Region } from '@/lib/channels'
import {
    getDayLabel,
    getFullDateLabel,
    todayStr,
    getDateKeyInTimezone,
    TIMEZONES,
} from '@/lib/utils'
import NextFeaturedBanner from '@/components/NextFeaturedBanner'
import InstallBanner from '@/components/InstallBanner'
import MatchCard from '@/components/MatchCard'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import ShareAppButton from '@/components/ShareAppButton'
import Navbar from '@/components/NavBar'

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
        return () => { cancelled = true }
    }, [])

    return { matches, loading, source }
}

function detectRegionByTimezone(): Region {
    if (typeof window === 'undefined') return 'dz'
    const savedRegion = localStorage.getItem('weshtv-region') as string | null
    if (savedRegion && savedRegion in REGIONS) return savedRegion as Region
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone === 'Europe/Oslo') return 'no'
    return 'dz'
}

export default function Home() {
    const { matches: allMatches, loading, source } = useMatches()
    const [region, setRegion] = useState<Region>('dz')
    const [selectedDate, setSelectedDate] = useState<string>('')

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setRegion(detectRegionByTimezone())
        }, 0)
        return () => window.clearTimeout(timer)
    }, [])

    const dates = useMemo(() => {
        const uniqueDates = new Set(
            allMatches.map((match) =>
                getDateKeyInTimezone(match.utcDate, TIMEZONES[region])
            )
        )

        return Array.from(uniqueDates).sort()
    }, [allMatches, region])

    const today = todayStr(region)
    const selectedDateResolved = useMemo(() => {
        if (selectedDate) return selectedDate

        if (dates.includes(today)) {
            return today
        }

        return dates.find((d) => d >= WORLD_CUP_START) ?? dates[0] ?? ''
    }, [selectedDate, dates, today])

    const matches = useMemo(
        () =>
            allMatches.filter(
                (match) =>
                    getDateKeyInTimezone(match.utcDate, TIMEZONES[region]) === selectedDateResolved
            ),
        [allMatches, selectedDateResolved, region]
    )
    const liveCount = useMemo(
        () => allMatches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length,
        [allMatches]
    )
    const playedCount = useMemo(
        () => allMatches.filter((m) => m.status === 'FINISHED').length,
        [allMatches]
    )

    const totalMatches = allMatches.length || 104
    const remainingMatches = Math.max(totalMatches - playedCount, 0)

    function handleRegionChange(nextRegion: Region) {
        setRegion(nextRegion)
        localStorage.setItem('weshtv-region', nextRegion)
    }

    function toggleRegion() {
        setRegion((cur) => {
            const next = cur === 'dz' ? 'no' : 'dz'
            localStorage.setItem('weshtv-region', next)
            return next
        })
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--black)',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: 14,
            }}
        >

            {/* NAV */}
            <Navbar
                region={region}
                source={source}
                loading={loading}
                onRegionChange={handleRegionChange}
            />
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
                    minHeight: 220,
                    padding: '34px 20px 28px',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'var(--black)',
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%',

                }}
            >
                {/* Dark / light overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'var(--hero-overlay)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: 920,
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            fontFamily: 'var(--font-barlow)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                            marginBottom: 18,
                            maxWidth: 820,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 'clamp(38px, 11vw, 72px)',
                                color: 'var(--hero-title)',
                                display: 'block',
                                lineHeight: 0.9,
                                marginBottom: 10,
                                textShadow: '0 2px 18px rgba(0,0,0,0.22)',
                            }}
                        >
                            Wesh,
                        </span>

                        <span
                            style={{
                                fontSize: 'clamp(18px, 4.6vw, 30px)',
                                display: 'block',
                                fontFamily: 'var(--font-inter)',
                                fontWeight: 600,
                                letterSpacing: '0.01em',
                                color: 'var(--hero-subtitle)',
                                textTransform: 'none',
                                lineHeight: 1.35,
                                maxWidth: 820,
                                textShadow: '0 1px 12px rgba(0,0,0,0.16)',
                            }}
                        >
                            c&apos;est sur quelle{' '}
                            <span
                                style={{
                                    fontFamily: 'var(--font-barlow)',
                                    fontWeight: 900,
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
                                    color: 'var(--accent)',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                heure?
                            </span>
                        </span>
                    </div>

                    {/* Meta row */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 12,
                                color: 'var(--hero-meta)',
                                fontFamily: 'var(--font-inter)',
                                fontWeight: 500,
                                textShadow: '0 1px 10px rgba(0,0,0,0.12)',
                            }}
                        >
                            48 teams · 104 matches · Jun 11 – Jul 19 🇺🇸🇨🇦🇲🇽
                        </span>

                        <ShareAppButton />
                    </div>
                </div>
            </div>

            {/* REST OF PAGE */}
            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >

                {/* STATS */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    borderBottom: '1px solid var(--border)',
                    borderTop: '1px solid var(--border)',
                }}>
                    {[
                        { n: '48', label: 'Teams' },
                        { n: `${remainingMatches}/${totalMatches}`, label: 'Matches left' },
                        { n: String(liveCount), label: 'Live now' },
                        { n: String(matches.length), label: 'Today' },
                    ].map(({ n, label }, i, arr) => (
                        <div key={label} style={{
                            padding: '14px 12px',
                            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{
                                fontSize: 24,
                                fontWeight: 800,
                                lineHeight: 1,
                                marginBottom: 4,
                                color: 'var(--text)',
                                fontVariantNumeric: 'tabular-nums',
                                fontFamily: 'var(--font-barlow)',
                            }}>
                                {label === 'Matches left' ? (
                                    <>
                                        <span
                                            style={{
                                                color: 'var(--accent)',
                                                fontSize: 18,
                                                marginRight: 3,
                                            }}
                                        >
                                            {remainingMatches}
                                        </span>
                                        <span style={{ color: 'var(--text)' }}>
                                            /{totalMatches}
                                        </span>
                                    </>
                                ) : (
                                    n
                                )}
                            </div>
                            <div style={{
                                fontSize: 9, color: 'var(--text-muted)',
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                fontWeight: 500,
                            }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* DATE STRIP */}
                <div style={{
                    display: 'flex', gap: 4, padding: '10px 20px',
                    borderBottom: '1px solid var(--border)', overflowX: 'auto',
                }}>
                    {dates.map((d) => {
                        const { weekday, day } = getDayLabel(d)
                        const active = d === selectedDateResolved
                        const isToday = d === today
                        return (
                            <button key={d} onClick={() => setSelectedDate(d)} style={{
                                flexShrink: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', padding: '6px 12px', borderRadius: 8,
                                border: active ? '1px solid rgba(46,204,113,0.35)' : '1px solid transparent',
                                background: active ? 'var(--accent-dim)' : 'transparent',
                                color: active || isToday ? 'var(--accent)' : 'var(--text-muted)',
                                transition: 'all 0.15s', minWidth: 46,
                            }}>
                                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>{weekday}</span>
                                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{day}</span>
                                {isToday && (
                                    <span style={{
                                        width: 3, height: 3, borderRadius: '50%', marginTop: 2,
                                        background: active ? 'var(--accent)' : '#444',
                                    }} />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* MATCHES */}
                <div style={{ padding: '16px 20px', flex: 1 }}>
                    <p style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
                        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
                    }}>
                        {getFullDateLabel(selectedDateResolved)} · {matches.length}{' '}
                        {matches.length === 1 ? 'match' : 'matches'}
                    </p>

                    {loading && (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            Loading matches...
                        </div>
                    )}

                    {!loading && matches.length === 0 && (
                        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                            No matches scheduled this day.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {matches.map((match) => (
                            <MatchCard key={match.id} match={match} region={region} />
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingBottom: 72 }}>
                    <Footer />
                </div>
            </div>


            <BottomNav region={region} onRegionToggle={toggleRegion} />
            <InstallBanner />
        </div>
    )
}