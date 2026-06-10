'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, getChannelsForMatch, getChannelColor, type Region } from '@/lib/channels'
import {
    getAllTimes, getDayLabel, getFullDateLabel, todayStr,
    isLateNight, isFeaturedMatch, getFeaturedTeam, FEATURED_TEAMS
} from '@/lib/utils'
import { filterByDate, getUniqueDates } from '@/lib/api'

const WORLD_CUP_START = '2026-06-11'

// ── Data hook ──────────────────────────────────────────────
function useMatches() {
    const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES)
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'mock' | 'api'>('mock')

    useEffect(() => {
        fetch('/api/matches')
            .then(r => r.json())
            .then(data => {
                setMatches(data.matches)
                setSource(data.source)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return { matches, loading, source }
}

// ── Channel pill ───────────────────────────────────────────
function ChannelPill({ name, region }: { name: string; region: Region }) {
    const color = getChannelColor(region, name)
    return (
        <span style={{
            padding: '2px 7px', borderRadius: 4,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
            background: `${color}18`, color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap',
        }}>
            {name}
        </span>
    )
}

// ── Live badge ─────────────────────────────────────────────
function LiveDot() {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--red)', display: 'inline-block',
                animation: 'livepulse 1.2s infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.1em' }}>LIVE</span>
        </span>
    )
}

// ── Team crest ─────────────────────────────────────────────
function Crest({ src, alt }: { src: string; alt: string }) {
    if (src?.startsWith('http')) {
        return <Image src={src} alt={alt} width={20} height={20} style={{ objectFit: 'contain' }} />
    }
    return <span style={{ fontSize: 16 }}>{src}</span>
}

// ── Time tooltip ───────────────────────────────────────────
function TimeTooltip({ utcDate, region }: { utcDate: string; region: Region }) {
    const t = getAllTimes(utcDate, region)
    const rows = [
        { label: '🇺🇸 USA (East)', time: t.us, highlight: false },
        { label: '🇩🇿 Algeria', time: t.dz, highlight: region === 'dz' },
        { label: '🇳🇴 Norway', time: t.no, highlight: region === 'no' },
    ]
    return (
        <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 14px', minWidth: 200,
        }}>
            <p style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Kickoff times
            </p>
            {rows.map(row => (
                <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0', gap: 16, borderBottom: '1px solid var(--border)',
                }}>
                    <span style={{ fontSize: 12, color: row.highlight ? 'var(--accent)' : '#888' }}>
                        {row.label}
                    </span>
                    <span style={{
                        fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        color: row.highlight ? 'var(--accent)' : 'var(--text)',
                    }}>
                        {row.time}
                        {row.highlight && t.nextDay && (
                            <span style={{ fontSize: 9, color: 'var(--red)', marginLeft: 4 }}>+1</span>
                        )}
                    </span>
                </div>
            ))}
            <p style={{ fontSize: 10, color: '#444', marginTop: 8, textAlign: 'center' }}>tap to close</p>
        </div>
    )
}

// ── Match card ─────────────────────────────────────────────
function MatchCard({ match, region }: { match: Match; region: Region }) {
    const [showTimes, setShowTimes] = useState(false)
    const [copied, setCopied] = useState(false)

    const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const finished = match.status === 'FINISHED'
    const hasScore = match.score.home !== null
    const t = getAllTimes(match.utcDate, region)
    const featured = isFeaturedMatch(match.homeTeam.short ?? '', match.awayTeam.short ?? '')
    const lateNight = isLateNight(match.utcDate, region)

    const channels = getChannelsForMatch(
        region,
        match.homeTeam.short,
        match.awayTeam.short,
        match.stage
    )

    // Share match via WhatsApp
    function shareMatch() {
        const time = t.local
        const text = `⚽ ${match.homeTeam.short} vs ${match.awayTeam.short} — ${time} (your time)\n📺 ${channels[0]}\n🔗 weshtv.vercel.app`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    // Copy match info
    function copyMatch() {
        const text = `${match.homeTeam.short} vs ${match.awayTeam.short} · ${t.local} · ${channels[0]}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!match.homeTeam.short && !match.awayTeam.short) {
        return (
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                        {match.stage?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 12, color: '#444' }}>Teams TBD — depends on group stage</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                    {t.local}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div style={{
                background: 'var(--surface)',
                border: featured
                    ? '1px solid rgba(46,204,113,0.35)'
                    : live
                        ? '1px solid rgba(46,204,113,0.2)'
                        : '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
            }}>

                {/* Featured left accent */}
                {featured && (
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 3, background: 'var(--accent)',
                    }} />
                )}

                {/* Live left accent */}
                {live && !featured && (
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 3, background: 'var(--red)',
                    }} />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr' }}>

                    {/* TIME */}
                    <button
                        onClick={() => setShowTimes(v => !v)}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '10px 6px', gap: 3,
                            background: showTimes ? 'var(--accent-dim)' : 'transparent',
                            border: 'none',
                            borderRight: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            width: '100%',
                        }}
                    >
                        {live ? <LiveDot /> : (
                            <>
                                <span style={{
                                    fontSize: 15, fontWeight: 700,
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'var(--text)', letterSpacing: '0.02em',
                                }}>
                                    {t.local}
                                </span>
                                <span style={{ fontSize: 9, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {finished ? 'FT' : 'KO'}
                                </span>
                                {t.nextDay && !live && (
                                    <span style={{ fontSize: 9, color: 'var(--red)', fontWeight: 600 }}>+1</span>
                                )}
                                {lateNight && !finished && (
                                    <span style={{ fontSize: 10 }}>🌙</span>
                                )}
                                <span style={{ fontSize: 9, color: '#444', marginTop: 1 }}>🕐</span>
                            </>
                        )}
                    </button>

                    {/* MATCH BODY */}
                    <div style={{ padding: '8px 12px' }}>

                        {/* Teams */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center', gap: 6, marginBottom: 6,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Crest src={match.homeTeam.flag} alt={match.homeTeam.name} />
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
                                    {match.homeTeam.short}
                                </span>
                            </div>

                            <div style={{
                                padding: '2px 8px', borderRadius: 5,
                                background: 'var(--surface2)',
                                fontSize: 12, fontWeight: 800,
                                color: hasScore ? 'var(--text)' : '#555',
                                textAlign: 'center', fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap', minWidth: 38,
                            }}>
                                {hasScore ? `${match.score.home}:${match.score.away}` : 'vs'}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
                                    {match.awayTeam.short}
                                </span>
                                <Crest src={match.awayTeam.flag} alt={match.awayTeam.name} />
                            </div>
                        </div>

                        {/* Meta + channels + share on same row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                {match.group && (
                                    <span style={{ fontSize: 10, color: '#555' }}>{match.group.replace(/_/g, ' ')}</span>
                                )}
                                <span style={{ fontSize: 10, color: '#333' }}>·</span>
                                {channels.map(ch => <ChannelPill key={ch} name={ch} region={region} />)}
                                {lateNight && !finished && (
                                    <span style={{
                                        fontSize: 10, color: 'var(--red)', fontWeight: 600,
                                        background: 'rgba(231,76,60,0.1)', padding: '1px 6px',
                                        borderRadius: 4, border: '1px solid rgba(231,76,60,0.3)',
                                    }}>
                                        🌙 Late night
                                    </span>
                                )}
                            </div>

                            {/* Share buttons */}
                            <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
                                <button
                                    onClick={shareMatch}
                                    title="Share on WhatsApp"
                                    style={{
                                        background: 'rgba(37,211,102,0.1)',
                                        border: '1px solid rgba(37,211,102,0.25)',
                                        borderRadius: 5, padding: '2px 7px',
                                        fontSize: 11, cursor: 'pointer', color: '#25d366',
                                        fontWeight: 600,
                                    }}
                                >
                                    WA
                                </button>
                                <button
                                    onClick={copyMatch}
                                    title="Copy match info"
                                    style={{
                                        background: 'var(--surface2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 5, padding: '2px 7px',
                                        fontSize: 11, cursor: 'pointer',
                                        color: copied ? 'var(--accent)' : '#555',
                                        fontWeight: 600,
                                    }}
                                >
                                    {copied ? '✓' : '⎘'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {showTimes && (
                <div style={{ marginTop: 4 }} onClick={() => setShowTimes(false)}>
                    <TimeTooltip utcDate={match.utcDate} region={region} />
                </div>
            )}
        </div>
    )
}

// ── Next featured match banner ─────────────────────────────
function NextFeaturedBanner({
    matches, region, onJump
}: {
    matches: Match[]
    region: Region
    onJump: (date: string) => void
}) {
    const t_now = new Date()
    const featured = FEATURED_TEAMS

    const next = matches.find(m => {
        const isFeat = featured.includes(m.homeTeam.short ?? '') || featured.includes(m.awayTeam.short ?? '')
        const isUpcoming = new Date(m.utcDate) > t_now
        return isFeat && isUpcoming && m.status === 'SCHEDULED'
    })

    if (!next) return null

    const t = getAllTimes(next.utcDate, region)
    const date = next.utcDate.split('T')[0]
    const channels = getChannelsForMatch(region, next.homeTeam.short, next.awayTeam.short, next.stage)
    const featuredTeam = getFeaturedTeam(next.homeTeam.short ?? '', next.awayTeam.short ?? '')
    const lateNight = isLateNight(next.utcDate, region)

    const teamFlags: Record<string, string> = {
        ALG: '🇩🇿', TUN: '🇹🇳', MAR: '🇲🇦', NOR: '🇳🇴'
    }
    const flag = featuredTeam ? teamFlags[featuredTeam] ?? '' : ''

    return (
        <div
            onClick={() => onJump(date)}
            style={{
                margin: '0 0 0 0',
                padding: '10px 20px',
                background: 'rgba(46,204,113,0.06)',
                borderBottom: '1px solid rgba(46,204,113,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{flag}</span>
                <div>
                    <div style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 2,
                    }}>
                        Next featured match
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                        {next.homeTeam.short} vs {next.awayTeam.short}
                        {lateNight && <span style={{ marginLeft: 6, fontSize: 12 }}>🌙</span>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                        {t.local}
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>
                        {new Date(next.utcDate).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                </div>
                <ChannelPill name={channels[0]} region={region} />
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>→</span>
            </div>
        </div>
    )
}

// ── Page ───────────────────────────────────────────────────
export default function Home() {
    const { matches: allMatches, loading, source } = useMatches()
    const [region, setRegion] = useState<Region>('dz')
    const dates = useMemo(() => getUniqueDates(allMatches), [allMatches])
    const today = todayStr()

    const [selectedDate, setSelectedDate] = useState<string>(
        dates.find(d => d >= WORLD_CUP_START) ?? dates[0] ?? ''
    )

    const selectedDateResolved = selectedDate || dates.find(d => d >= WORLD_CUP_START) || dates[0] || ''

    const matches = useMemo(() => filterByDate(allMatches, selectedDateResolved), [allMatches, selectedDateResolved])
    const liveCount = allMatches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED').length

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
                <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '0.08em' }}>
                    WESH<span style={{ color: 'var(--accent)' }}>TV</span>
                    {' '}
                    <span style={{
                        fontSize: 9, fontWeight: 500, letterSpacing: '0.1em',
                        verticalAlign: 'middle',
                        color: source === 'api' ? 'var(--accent)' : '#444',
                    }}>
                        {loading ? '...' : source === 'api' ? '● LIVE' : '● MOCK'}
                    </span>
                </span>
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

            {/* NEXT FEATURED BANNER */}
            <NextFeaturedBanner
                matches={allMatches}
                region={region}
                onJump={setSelectedDate}
            />

            {/* HERO */}
            <div style={{ padding: '40px 24px 28px', borderBottom: '1px solid var(--border)' }}>
                <p style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14,
                }}>
                    FIFA World Cup 2026 · USA · Canada · Mexico
                </p>
                <h1 style={{
                    fontWeight: 900, lineHeight: 0.95,
                    letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 16,
                }}>
                    <span style={{ fontSize: 'clamp(64px, 12vw, 130px)', display: 'block' }}>Wesh,</span>
                    <span style={{ fontSize: 'clamp(28px, 5vw, 52px)', display: 'block', color: '#333' }}>
                        c'est sur quelle<br />
                        <span style={{ color: 'var(--accent)' }}>chaîne</span>
                        <span style={{ color: '#333' }}> et à quelle </span>
                        <span style={{ color: 'var(--accent)', opacity: 0.6 }}>heure</span>
                        <span style={{ color: '#333' }}>?</span>
                    </span>
                </h1>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                    Every match. Every channel. Tap the time for timezone breakdown.
                </p>
            </div>

            <div style={{ maxWidth: 860, margin: '0 auto' }}>

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
                            padding: '16px 16px',
                            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{
                                fontSize: 26, fontWeight: 800, lineHeight: 1, marginBottom: 4,
                                color: accent ? 'var(--accent)' : 'var(--text)',
                                fontVariantNumeric: 'tabular-nums',
                            }}>{n}</div>
                            <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
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
                    {dates.map(d => {
                        const { weekday, day } = getDayLabel(d)
                        const active = d === selectedDateResolved
                        const isToday = d === today
                        return (
                            <button key={d} onClick={() => setSelectedDate(d)} style={{
                                flexShrink: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', padding: '6px 12px', borderRadius: 8,
                                border: active ? '1px solid rgba(46,204,113,0.35)' : '1px solid transparent',
                                background: active ? 'var(--accent-dim)' : 'transparent',
                                color: active ? 'var(--accent)' : '#555',
                                transition: 'all 0.15s', minWidth: 46,
                            }}>
                                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>{weekday}</span>
                                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{day}</span>
                                {isToday && (
                                    <span style={{ width: 3, height: 3, borderRadius: '50%', marginTop: 2, background: active ? 'var(--accent)' : '#444' }} />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* MATCHES */}
                <div style={{ padding: '16px 20px' }}>
                    <p style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
                        textTransform: 'uppercase', color: '#555', marginBottom: 12,
                    }}>
                        {getFullDateLabel(selectedDateResolved)} · {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                    </p>

                    {loading && (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#444', fontSize: 13 }}>
                            Loading matches...
                        </div>
                    )}

                    {!loading && matches.length === 0 && (
                        <div style={{ padding: '60px 0', textAlign: 'center', color: '#444', fontSize: 14 }}>
                            No matches scheduled this day.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {matches.map(match => (
                            <MatchCard key={match.id} match={match} region={region} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}