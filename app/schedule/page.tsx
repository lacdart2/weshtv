'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, getChannelsForMatch, getChannelColor, type Region } from '@/lib/channels'
import { getAllTimes, isFeaturedMatch } from '@/lib/utils'
import { Search, Heart } from 'lucide-react'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import ThemeToggle from '@/components/ThemeToggle'
import { getTeamFlag } from '@/lib/teamFlags'
import { useMyTeams } from '@/lib/myTeams'
import MyTeamsPicker from '@/components/MyTeamsPicker'

function useMatches() {
    const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES)
    useEffect(() => {
        fetch('/api/matches')
            .then(r => r.json())
            .then(data => setMatches(data.matches ?? MOCK_MATCHES))
            .catch(() => { })
    }, [])
    return matches
}

function detectRegionByTimezone(): Region {
    if (typeof window === 'undefined') return 'dz'
    const saved = localStorage.getItem('weshtv-region')
    if (saved && saved in REGIONS) return saved as Region
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Europe/Oslo') return 'no'
    return 'dz'
}

function groupByDate(matches: Match[]): Record<string, Match[]> {
    return matches.reduce((acc, m) => {
        const date = m.utcDate.split('T')[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(m)
        return acc
    }, {} as Record<string, Match[]>)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en', {
        weekday: 'short', day: 'numeric', month: 'short',
    })
}

function TeamName({ code }: { code?: string }) {
    if (!code) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>TBD</span>
    const flag = getTeamFlag(code)
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 5, minWidth: 0, overflow: 'hidden',
            lineHeight: 1,
        }}>
            {flag && (
                <span style={{
                    fontSize: 18, flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center',
                    lineHeight: 1,
                }}>
                    {flag}
                </span>
            )}
            <span style={{
                fontSize: 14, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: 'var(--text)', fontFamily: 'var(--font-barlow)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1,
            }}>
                {code}
            </span>
        </span>
    )
}
const ALIASES: Record<string, string[]> = {
    ALG: ['ALG', 'DZA'], DZA: ['ALG', 'DZA'],
    MAR: ['MAR', 'MOR'], MOR: ['MAR', 'MOR'],
}
function matchesMyTeam(code: string, teams: string[]): boolean {
    const upper = code.toUpperCase()
    return teams.some(t => (ALIASES[t] ?? [t]).includes(upper))
}

export default function SchedulePage() {
    const allMatches = useMatches()
    const [region, setRegion] = useState<Region>('dz')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'featured'>('all')
    const { myTeams, toggleTeam } = useMyTeams()
    const [pickerOpen, setPickerOpen] = useState(false)

    useEffect(() => {
        const timer = window.setTimeout(() => setRegion(detectRegionByTimezone()), 0)
        return () => window.clearTimeout(timer)
    }, [])

    const filtered = useMemo(() => allMatches.filter(m => {
        const home = m.homeTeam.short ?? ''
        const away = m.awayTeam.short ?? ''
        const matchesSearch = search === '' ||
            home.toLowerCase().includes(search.toLowerCase()) ||
            away.toLowerCase().includes(search.toLowerCase()) ||
            m.homeTeam.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.awayTeam.name?.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'all' ||
            (myTeams.length > 0
                ? matchesMyTeam(home, myTeams) || matchesMyTeam(away, myTeams)
                : false)
        return matchesSearch && matchesFilter
    }), [allMatches, search, filter, myTeams])

    const grouped = useMemo(() => groupByDate(filtered), [filtered])
    const dates = Object.keys(grouped).sort()

    function handleRegionChange(nextRegion: Region) {
        setRegion(nextRegion)
        localStorage.setItem('weshtv-region', nextRegion)
    }

    function toggleRegion() {
        setRegion(cur => {
            const next = cur === 'dz' ? 'no' : 'dz'
            localStorage.setItem('weshtv-region', next)
            return next
        })
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column' }}>

            {/* NAV */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', height: 52,
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0,
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(10px)', zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{
                            fontWeight: 900, fontSize: 17,
                            letterSpacing: '0.08em', fontFamily: 'var(--font-barlow)',
                            color: 'var(--text)',
                        }}>
                            WESH<span style={{ color: 'var(--accent)' }}>TV</span>
                        </span>
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(([key, r]) => (
                        <button key={key} onClick={() => handleRegionChange(key)} style={{
                            padding: '5px 10px', borderRadius: 6,
                            fontSize: 11, fontWeight: 500,
                            border: region === key ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)',
                            background: region === key ? 'var(--accent-dim)' : 'transparent',
                            color: region === key ? 'var(--accent)' : 'var(--text-muted)',
                            transition: 'all 0.15s',
                        }}>
                            {r.flag} {r.region}
                        </button>
                    ))}
                    <ThemeToggle />
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px', flex: 1, width: '100%' }}>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-barlow)', fontSize: 32, fontWeight: 900,
                        textTransform: 'uppercase', letterSpacing: '-0.01em',
                        color: 'var(--text)', marginBottom: 4,
                    }}>
                        Programme Complet
                    </h1>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        104 matches · Jun 11 – Jul 19 · times in your region
                    </p>
                </div>

                {/* Search + filter */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                        <Search size={14} style={{
                            position: 'absolute', left: 10,
                            top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }} />
                        <input
                            type="text"
                            placeholder="Search team..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '9px 12px 9px 32px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 8, color: 'var(--text)',
                                fontSize: 13, fontFamily: 'var(--font-inter)',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['all', 'featured'] as const).map(f => (
                            /*  <button key={f} onClick={() => setFilter(f)} style={{ */
                            <button key={f} onClick={() => { setFilter(f); if (f === 'featured') setPickerOpen(true) }} style={{
                                padding: '8px 14px', borderRadius: 8,
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: filter === f ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)',
                                background: filter === f ? 'var(--accent-dim)' : 'transparent',
                                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                                fontFamily: 'var(--font-inter)',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                {f === 'featured' ? (
                                    <>
                                        <Heart size={12} style={{ fill: myTeams.length > 0 ? 'currentColor' : 'none' }} />
                                        My teams
                                        {myTeams.length > 0 && (
                                            <span style={{
                                                background: 'var(--accent)', color: '#000',
                                                fontSize: 9, fontWeight: 800,
                                                borderRadius: 999, padding: '1px 5px',
                                                fontFamily: 'var(--font-inter)',
                                            }}>
                                                {myTeams.length}
                                            </span>
                                        )}
                                    </>
                                ) : 'All matches'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Match count */}
                <p style={{
                    fontSize: 11, color: 'var(--text-muted)', marginBottom: 16,
                    letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
                }}>
                    {filtered.length} matches
                </p>

                {/* Schedule */}
                {dates.map(date => (
                    <div key={date} style={{ marginBottom: 28 }}>

                        {/* Date header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: 10, paddingBottom: 8,
                            borderBottom: '2px solid var(--border)',
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-barlow)',
                                fontSize: 16, fontWeight: 900,
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}>
                                {formatDate(date)}
                            </span>
                            <span style={{
                                fontSize: 11, color: 'var(--text-muted)',
                                fontFamily: 'var(--font-inter)',
                            }}>
                                {grouped[date].length} {grouped[date].length === 1 ? 'match' : 'matches'}
                            </span>
                        </div>

                        {/* Match rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {grouped[date].map(match => {
                                const t = getAllTimes(match.utcDate, region)
                                const channels = getChannelsForMatch(region, match.homeTeam.short, match.awayTeam.short, match.stage)
                                const mainChannel = channels[0]
                                const channelColor = getChannelColor(region, mainChannel)
                                const featured = isFeaturedMatch(match.homeTeam.short ?? '', match.awayTeam.short ?? '')
                                const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
                                const finished = match.status === 'FINISHED'
                                const hasScore = match.score.home !== null

                                return (
                                    <Link key={match.id} href={`/match/${match.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="schedule-match-row"
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: 10,
                                                background: featured ? 'rgba(46,204,113,0.05)' : 'var(--surface)',
                                                border: featured
                                                    ? '1px solid rgba(46,204,113,0.25)'
                                                    : live
                                                        ? '1px solid rgba(231,76,60,0.25)'
                                                        : '1px solid var(--border)',
                                                transition: 'background 0.15s',
                                                boxShadow: 'var(--card-shadow)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                                            onMouseLeave={e => e.currentTarget.style.background = featured ? 'rgba(46,204,113,0.05)' : 'var(--surface)'}
                                        >

                                            {/* Top row — time + teams + channel */}
                                            <div className="schedule-row">
                                                <div style={{ minWidth: 54, textAlign: 'center', flexShrink: 0 }}>
                                                    {live ? (
                                                        <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>● LIVE</span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: 18, fontWeight: 900,
                                                            color: 'var(--text)',
                                                            fontFamily: 'var(--font-barlow)',
                                                            fontVariantNumeric: 'tabular-nums',
                                                            letterSpacing: '0.02em',
                                                        }}>
                                                            {t.local}
                                                        </span>
                                                    )}
                                                    <div style={{
                                                        fontSize: 9, color: 'var(--text-muted)',
                                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                                        marginTop: 1,
                                                    }}>
                                                        {finished ? 'FT' : live ? '' : 'KO'}
                                                    </div>
                                                </div>
                                                <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />
                                                <div className="schedule-teams">
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
                                                        <TeamName code={match.homeTeam.short} />
                                                    </div>

                                                    <span style={{
                                                        fontSize: 13, fontWeight: 700,
                                                        color: hasScore ? 'var(--text)' : 'var(--text-muted)',
                                                        fontVariantNumeric: 'tabular-nums',
                                                        background: 'var(--surface2)',
                                                        border: '1px solid var(--border)',
                                                        padding: '2px 8px', borderRadius: 5,
                                                        fontFamily: 'var(--font-barlow)',
                                                        flexShrink: 0,
                                                        textAlign: 'center',
                                                    }}>
                                                        {hasScore ? `${match.score.home}:${match.score.away}` : 'vs'}
                                                    </span>

                                                    <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 0 }}>
                                                        <TeamName code={match.awayTeam.short} />
                                                    </div>
                                                </div>
                                                {mainChannel && (
                                                    <div className="schedule-channel">
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 600,
                                                            padding: '3px 8px', borderRadius: 5,
                                                            background: `${channelColor}15`,
                                                            color: channelColor,
                                                            border: `1px solid ${channelColor}35`,
                                                            whiteSpace: 'nowrap',
                                                            fontFamily: 'var(--font-inter)',
                                                        }}>
                                                            {mainChannel}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        No matches found.
                    </div>
                )}

                <div style={{ height: 80 }} />
            </div>
            <MyTeamsPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                myTeams={myTeams}
                onToggle={toggleTeam}
            />
            <Footer />
            {/*  <BottomNav region={region} onRegionToggle={toggleRegion} /> */}
            <BottomNav />
        </div>
    )
}