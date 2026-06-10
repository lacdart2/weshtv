'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search } from 'lucide-react'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, getChannelsForMatch, getChannelColor, type Region } from '@/lib/channels'
import { getAllTimes, isFeaturedMatch } from '@/lib/utils'

const FEATURED_TEAMS = ['ALG', 'TUN', 'MAR', 'NOR', 'EGY']

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

export default function SchedulePage() {
    const allMatches = useMatches()
    const [region, setRegion] = useState<Region>('dz')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'featured'>('all')

    const filtered = useMemo(() => {
        return allMatches.filter(m => {
            const home = m.homeTeam.short ?? ''
            const away = m.awayTeam.short ?? ''
            const matchesSearch = search === '' ||
                home.toLowerCase().includes(search.toLowerCase()) ||
                away.toLowerCase().includes(search.toLowerCase()) ||
                m.homeTeam.name?.toLowerCase().includes(search.toLowerCase()) ||
                m.awayTeam.name?.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = filter === 'all' || isFeaturedMatch(home, away)
            return matchesSearch && matchesFilter
        })
    }, [allMatches, search, filter])

    const grouped = useMemo(() => groupByDate(filtered), [filtered])
    const dates = Object.keys(grouped).sort()

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)' }}>

            {/* NAV */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', height: 52,
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0,
                background: 'rgba(9,9,9,0.94)',
                backdropFilter: 'blur(10px)', zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/" style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: '#666', textDecoration: 'none', fontSize: 13,
                    }}>
                        <ChevronLeft size={16} /> Home
                    </Link>
                    <span style={{
                        fontWeight: 900, fontSize: 17,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-barlow)',
                    }}>
                        WESH<span style={{ color: 'var(--accent)' }}>TV</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(([key, r]) => (
                        <button key={key} onClick={() => setRegion(key)} style={{
                            padding: '5px 11px', borderRadius: 6,
                            fontSize: 12, fontWeight: 500,
                            border: region === key ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)',
                            background: region === key ? 'var(--accent-dim)' : 'transparent',
                            color: region === key ? 'var(--accent)' : '#666',
                            transition: 'all 0.15s',
                        }}>
                            {r.flag} {r.region}
                        </button>
                    ))}
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px' }}>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-barlow)',
                        fontSize: 32, fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em',
                        color: 'var(--text)', marginBottom: 4,
                    }}>
                        Full Schedule
                    </h1>
                    <p style={{ fontSize: 12, color: '#666' }}>
                        104 matches · Jun 11 – Jul 19 · times in your region
                    </p>
                </div>

                {/* Search + filter */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{
                            position: 'absolute', left: 10,
                            top: '50%', transform: 'translateY(-50%)',
                            color: '#555',
                        }} />
                        <input
                            type="text"
                            placeholder="Search team..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px 8px 32px',
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
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '8px 14px', borderRadius: 8,
                                fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                                border: filter === f ? '1px solid rgba(46,204,113,0.4)' : '1px solid var(--border)',
                                background: filter === f ? 'var(--accent-dim)' : 'transparent',
                                color: filter === f ? 'var(--accent)' : '#666',
                                fontFamily: 'var(--font-inter)',
                                textTransform: 'capitalize',
                            }}>
                                {f === 'featured' ? '⭐ My teams' : 'All matches'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Match count */}
                <p style={{
                    fontSize: 11, color: '#555', marginBottom: 16,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontWeight: 600,
                }}>
                    {filtered.length} matches
                </p>

                {/* Schedule table */}
                {dates.map(date => (
                    <div key={date} style={{ marginBottom: 24 }}>

                        {/* Date header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            marginBottom: 8,
                            padding: '6px 0',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-barlow)',
                                fontSize: 14, fontWeight: 800,
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                {formatDate(date)}
                            </span>
                            <span style={{ fontSize: 11, color: '#777' }}>
                                {grouped[date].length} matches
                            </span>
                        </div>

                        {/* Matches for this date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {grouped[date].map(match => {
                                const t = getAllTimes(match.utcDate, region)
                                const channels = getChannelsForMatch(
                                    region,
                                    match.homeTeam.short,
                                    match.awayTeam.short,
                                    match.stage
                                )
                                const mainChannel = channels[0]
                                const channelColor = getChannelColor(region, mainChannel)
                                const featured = isFeaturedMatch(
                                    match.homeTeam.short ?? '',
                                    match.awayTeam.short ?? ''
                                )
                                const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
                                const finished = match.status === 'FINISHED'
                                const hasScore = match.score.home !== null

                                return (
                                    <Link
                                        key={match.id}
                                        href={`/match/${match.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '52px 1fr auto',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            background: featured ? 'rgba(46,204,113,0.04)' : 'var(--surface)',
                                            border: featured
                                                ? '1px solid rgba(46,204,113,0.2)'
                                                : live
                                                    ? '1px solid rgba(231,76,60,0.2)'
                                                    : '1px solid transparent',
                                            transition: 'border-color 0.15s, background 0.15s',
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = 'var(--border)'
                                                e.currentTarget.style.background = 'var(--surface2)'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = featured
                                                    ? 'rgba(46,204,113,0.2)'
                                                    : live ? 'rgba(231,76,60,0.2)' : 'transparent'
                                                e.currentTarget.style.background = featured
                                                    ? 'rgba(46,204,113,0.04)' : 'var(--surface)'
                                            }}
                                        >
                                            {/* TIME */}
                                            <div style={{ textAlign: 'center' }}>
                                                {live ? (
                                                    <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>● LIVE</span>
                                                ) : (
                                                    <span style={{
                                                        fontSize: 14, fontWeight: 800,
                                                        color: 'var(--text)',
                                                        fontFamily: 'var(--font-barlow)',
                                                        fontVariantNumeric: 'tabular-nums',
                                                    }}>
                                                        {t.local}
                                                    </span>
                                                )}
                                                <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>
                                                    {finished ? 'FT' : live ? '' : 'KO'}
                                                </div>
                                            </div>

                                            {/* TEAMS */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                                <span style={{
                                                    fontSize: 13, fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    color: 'var(--text)',
                                                    fontFamily: 'var(--font-barlow)',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {match.homeTeam.short ?? 'TBD'}
                                                </span>

                                                <span style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: hasScore ? 'var(--text)' : '#444',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    background: 'var(--surface2)',
                                                    padding: '2px 8px', borderRadius: 4,
                                                    fontFamily: 'var(--font-barlow)',
                                                }}>
                                                    {hasScore ? `${match.score.home}:${match.score.away}` : 'vs'}
                                                </span>

                                                <span style={{
                                                    fontSize: 13, fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    color: 'var(--text)',
                                                    fontFamily: 'var(--font-barlow)',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {match.awayTeam.short ?? 'TBD'}
                                                </span>

                                                {match.group && (
                                                    <span style={{ fontSize: 10, color: '#777', marginLeft: 4 }}>
                                                        {match.group.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* CHANNEL */}
                                            <div style={{ flexShrink: 0 }}>
                                                {mainChannel && (
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 600,
                                                        padding: '2px 8px', borderRadius: 4,
                                                        background: `${channelColor}18`,
                                                        color: channelColor,
                                                        border: `1px solid ${channelColor}40`,
                                                        whiteSpace: 'nowrap',
                                                        fontFamily: 'var(--font-inter)',
                                                    }}>
                                                        {mainChannel}
                                                    </span>
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
                    <div style={{
                        padding: '60px 0', textAlign: 'center',
                        color: '#666', fontSize: 14,
                    }}>
                        No matches found.
                    </div>
                )}

                {/* Bottom padding for nav */}
                <div style={{ height: 72 }} />
            </div>
        </div>
    )
}