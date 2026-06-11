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
//import ThemeToggle from '@/components/ThemeToggle'
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
        () => allMatches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length,
        [allMatches]
    )

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
            <div style={{
                padding: '20px 20px 18px',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url(https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
            }}>
                {/* Dark overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'var(--hero-overlay)',
                    zIndex: 0, pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Title */}
                    <div style={{
                        fontFamily: 'var(--font-barlow)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        letterSpacing: '-0.01em',
                        marginBottom: 10,
                    }}>
                        <span style={{
                            fontSize: 'clamp(42px, 8vw, 72px)',
                            color: 'var(--text)',
                            display: 'inline',
                        }}>
                            Wesh,{' '}
                        </span>
                        <span style={{
                            fontSize: 'clamp(13px, 2vw, 18px)',
                            display: 'inline',
                            fontFamily: 'var(--font-inter)',
                            fontWeight: 300,
                            letterSpacing: '0.01em',
                            color: 'var(--text-muted)',
                            textTransform: 'none',
                        }}>
                            c&apos;est sur quelle{' '}
                            <span style={{
                                fontFamily: 'var(--font-barlow)',
                                fontWeight: 900,
                                fontSize: 'clamp(16px, 2.8vw, 26px)',
                                color: 'var(--accent)',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}>
                                chaîne
                            </span>
                            {' '}et à quelle{' '}
                            <span style={{
                                fontFamily: 'var(--font-barlow)',
                                fontWeight: 900,
                                fontSize: 'clamp(16px, 2.8vw, 26px)',
                                color: 'var(--accent)',
                                opacity: 0.6,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}>
                                heure?
                            </span>
                        </span>
                    </div>

                    {/* Meta row — compact single line */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 8,
                    }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
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
                        { n: '48', label: 'Teams', accent: false },
                        { n: '104', label: 'Matches', accent: false },
                        { n: String(liveCount), label: 'Live now', accent: liveCount > 0 },
                        { n: String(matches.length), label: 'Today', accent: false },
                    ].map(({ n, label, accent }, i, arr) => (
                        <div key={label} style={{
                            padding: '14px 12px',
                            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{
                                fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 4,
                                color: accent ? 'var(--accent)' : 'var(--text)',
                                fontVariantNumeric: 'tabular-nums',
                                fontFamily: 'var(--font-barlow)',
                            }}>
                                {n}
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
                                color: active ? 'var(--accent)' : 'var(--text-muted)',
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