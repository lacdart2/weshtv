'use client'

import { MouseEvent, useState } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/matches'
import { type Region, getChannelsForMatch } from '@/lib/channels'
import { getAllTimes, isLateNight, isFeaturedMatch } from '@/lib/utils'
import { getVenue } from '@/lib/venues'
import Crest from './Crest'
import LiveDot from './LiveDot'
import ChannelPill from './ChannelPill'
import TimeTooltip from './TimeTooltip'
import { Moon, Copy, Check } from 'lucide-react'
import { getVenueByTeams } from '@/lib/matchVenues'

export default function MatchCard({
    match,
    region,
}: {
    match: Match
    region: Region
}) {
    const [showTimes, setShowTimes] = useState(false)
    const [copied, setCopied] = useState(false)

    const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const finished = match.status === 'FINISHED'
    const hasScore = match.score.home !== null

    const t = getAllTimes(match.utcDate, region)

    const featured = isFeaturedMatch(
        match.homeTeam.short ?? '',
        match.awayTeam.short ?? ''
    )

    const lateNight = isLateNight(match.utcDate, region)

    const channels = getChannelsForMatch(
        region,
        match.homeTeam.short,
        match.awayTeam.short,
        match.stage
    )

    const venueNameFromTeams = getVenueByTeams(match.homeTeam.short, match.awayTeam.short)
    const venue = getVenue(match.venue) ?? getVenue(venueNameFromTeams ?? '')

    function shareMatch(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()

        const text = `⚽ ${match.homeTeam.short} vs ${match.awayTeam.short}\n🕐 ${t.local}${lateNight ? ' 🌙' : ''}\n📺 ${channels[0]}\n👉 weshtv.vercel.app`

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    function copyMatch(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()

        navigator.clipboard.writeText(
            `${match.homeTeam.short} vs ${match.awayTeam.short} · ${t.local} · ${channels[0]}`
        )

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function toggleTimes(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()
        setShowTimes((value) => !value)
    }

    if (!match.homeTeam.short && !match.awayTeam.short) {
        return (
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        right: 12,
                        bottom: -18,
                        fontSize: 72,
                        fontWeight: 900,
                        color: 'var(--match-watermark)',
                        fontFamily: 'var(--font-barlow)',
                        lineHeight: 1,
                    }}
                >
                    2026
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 3,
                        }}
                    >
                        {match.stage?.replace(/_/g, ' ')}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Teams TBD — depends on group stage
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--text)',
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: 'var(--font-barlow)',
                    }}
                >
                    {t.local}
                </div>
            </div>
        )
    }

    return (
        <div>
            <Link
                href={`/match/${match.id}`}
                style={{
                    textDecoration: 'none',
                    display: 'block',
                }}
            >
                <div
                    style={{
                        background: featured
                            ? 'var(--match-card-featured-bg)'
                            : 'var(--match-card-bg)',
                        border: featured
                            ? '1px solid rgba(46,204,113,0.35)'
                            : live
                                ? '1px solid rgba(231,76,60,0.35)'
                                : '1px solid var(--border)',
                        borderRadius: 14,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: featured
                            ? '0 8px 30px rgba(46,204,113,0.1)'
                            : 'var(--card-shadow)',
                        transition:
                            'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                    }}

                    onMouseEnter={(event) => {
                        event.currentTarget.style.transform = 'translateY(-1px)'
                        event.currentTarget.style.boxShadow = featured
                            ? 'var(--match-card-featured-hover-shadow)'
                            : 'var(--match-card-hover-shadow)'
                        event.currentTarget.style.borderColor = featured
                            ? 'rgba(46,204,113,0.6)'
                            : 'var(--match-card-hover-border)'
                    }}

                    onMouseLeave={(event) => {
                        event.currentTarget.style.transform = 'translateY(0)'
                        event.currentTarget.style.boxShadow = featured
                            ? '0 4px 20px rgba(46,204,113,0.12)'
                            : 'var(--card-shadow)'
                        event.currentTarget.style.borderColor = featured
                            ? 'rgba(46,204,113,0.35)'
                            : 'var(--border)'
                    }}
                >
                    <FlagBackdrop
                        homeFlag={match.homeTeam.flag}
                        awayFlag={match.awayTeam.flag}
                        homeName={match.homeTeam.name}
                        awayName={match.awayTeam.name}
                    />

                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            right: 10,
                            bottom: -20,
                            zIndex: 1,
                            fontSize: 86,
                            fontWeight: 900,
                            color: 'var(--match-watermark)',
                            fontFamily: 'var(--font-barlow)',
                            lineHeight: 1,
                            letterSpacing: '-0.05em',
                            pointerEvents: 'none',
                        }}
                    >
                        2026
                    </div>

                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1,
                            background: 'var(--match-card-overlay)',
                            pointerEvents: 'none',
                        }}
                    />

                    {featured && (
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 3,
                                height: 2,
                                background:
                                    'linear-gradient(90deg, var(--accent), transparent)',
                            }}
                        />
                    )}

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 14px 0',
                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10,
                                color: 'var(--match-muted)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            {match.group?.replace(/_/g, ' ') ||
                                match.stage?.replace(/_/g, ' ')}
                        </span>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {live && <LiveDot />}

                            {lateNight && !finished && (
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: 'var(--red)',
                                        fontWeight: 600,
                                        background: 'rgba(231,76,60,0.1)',
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        border: '1px solid rgba(231,76,60,0.2)',
                                        fontFamily: 'var(--font-inter)',
                                    }}
                                >
                                    <Moon size={10} /> Late night
                                </span>
                            )}

                            {t.nextDay && !live && (
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: 'var(--red)',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-inter)',
                                    }}
                                >
                                    +1 day
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            padding: '12px 14px 10px',
                            gap: 8,
                            maxWidth: 480,
                            margin: '0 auto',
                            width: '100%',
                        }}
                    >
                        <TeamBlock
                            flag={match.homeTeam.flag}
                            name={match.homeTeam.name}
                            shortName={match.homeTeam.short}
                        />

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                minWidth: 90,
                            }}
                        >
                            <button
                                onClick={toggleTimes}
                                style={{
                                    background: showTimes
                                        ? 'var(--accent-dim)'
                                        : 'var(--match-glass-bg)',
                                    border: showTimes
                                        ? '1px solid var(--accent-mid)'
                                        : '1px solid var(--match-glass-border)',
                                    borderRadius: 8,
                                    padding: '6px 14px',
                                    cursor: 'pointer',
                                    boxShadow:
                                        'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 18px rgba(0,0,0,0.35)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 900,
                                        fontVariantNumeric: 'tabular-nums',
                                        color: showTimes
                                            ? 'var(--accent)'
                                            : 'var(--text)',
                                        letterSpacing: '0.02em',
                                        fontFamily: 'var(--font-barlow)',
                                    }}
                                >
                                    {live
                                        ? `${match.score.home ?? 0} : ${match.score.away ?? 0}`
                                        : hasScore
                                            ? `${match.score.home} : ${match.score.away}`
                                            : t.local}
                                </span>
                            </button>

                            <span
                                style={{
                                    fontSize: 9,
                                    color: '#777',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'var(--font-inter)',
                                }}
                            >
                                {live ? 'live' : finished ? 'full time' : 'ko · tap'}
                            </span>
                        </div>

                        <TeamBlock
                            flag={match.awayTeam.flag}
                            name={match.awayTeam.name}
                            shortName={match.awayTeam.short}
                        />
                    </div>

                    {venue && (
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 3,
                                padding: '0 14px 10px',
                                textAlign: 'center',
                                fontSize: 10,
                                color: '#777',
                                fontFamily: 'var(--font-inter)',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {venue.name} · {venue.city}
                        </div>
                    )}

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 14px 10px',
                            gap: 8,
                            borderTop: '1px solid var(--border)',
                            background: 'var(--match-card-footer-bg)',
                            flexWrap: 'wrap',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: 5,
                                flexWrap: 'wrap',
                                alignItems: 'center',
                            }}
                        >
                            {channels.slice(0, 3).map((channel) => (
                                <ChannelPill
                                    key={channel}
                                    name={channel}
                                    region={region}
                                />
                            ))}

                            {channels.length > 3 && (
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: '#777',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-inter)',
                                    }}
                                >
                                    +{channels.length - 3}
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 5,
                                flexShrink: 0,
                            }}
                        >
                            <button
                                onClick={shareMatch}
                                style={{
                                    background: 'rgba(37,211,102,0.08)',
                                    border: '1px solid rgba(37,211,102,0.2)',
                                    borderRadius: 5,
                                    padding: '3px 8px',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                    color: '#25d366',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-inter)',
                                }}
                            >
                                WA
                            </button>

                            <button
                                onClick={copyMatch}
                                style={{
                                    background: 'var(--surface2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 5,
                                    padding: '3px 8px',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                    color: copied ? 'var(--accent)' : 'var(--match-muted)',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-inter)',
                                }}
                            >
                                {copied ? <Check size={10} /> : <Copy size={10} />}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            {showTimes && (
                <div
                    style={{ marginTop: 4 }}
                    onClick={() => setShowTimes(false)}
                >
                    <TimeTooltip utcDate={match.utcDate} region={region} />
                </div>
            )}
        </div>
    )
}

function TeamBlock({
    flag,
    name,
    shortName,
}: {
    flag?: string
    name?: string
    shortName?: string
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
            }}
        >
            <div
                style={{
                    width: 54,
                    height: 54,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--match-glass-bg)',
                    borderRadius: 13,
                    padding: 6,
                    border: '1px solid var(--match-glass-border)',
                    boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 18px rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Crest src={flag} alt={name ?? 'Team flag'} size={36} />
            </div>

            <span
                style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-barlow)',
                }}
            >
                {shortName}
            </span>
        </div>
    )
}

function FlagBackdrop({
    homeFlag,
    awayFlag,
    homeName,
    awayName,
}: {
    homeFlag?: string
    awayFlag?: string
    homeName?: string
    awayName?: string
}) {
    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            <FlagVisual flag={homeFlag} label={homeName} side="left" />
            <FlagVisual flag={awayFlag} label={awayName} side="right" />
        </div>
    )
}

function FlagVisual({
    flag,
    label,
    side,
}: {
    flag?: string
    label?: string
    side: 'left' | 'right'
}) {
    if (!flag) return null

    const isImage = flag.startsWith('http')

    if (isImage) {
        return (
            <img
                src={flag}
                alt=""
                title={label}
                style={{
                    position: 'absolute',
                    top: '50%',
                    [side]: -22,
                    width: 170,
                    height: 120,
                    objectFit: 'cover',
                    opacity: 0.12,
                    transform:
                        side === 'left'
                            ? 'translateY(-50%) rotate(-8deg)'
                            : 'translateY(-50%) rotate(8deg)',
                    filter: 'saturate(1.2) contrast(1.05)',
                }}
            />
        )
    }

    return (
        <span
            title={label}
            style={{
                position: 'absolute',
                top: '50%',
                [side]: -8,
                fontSize: 92,
                opacity: 0.1,
                lineHeight: 1,
                transform:
                    side === 'left'
                        ? 'translateY(-50%) rotate(-8deg)'
                        : 'translateY(-50%) rotate(8deg)',
                filter: 'saturate(1.2)',
            }}
        >
            {flag}
        </span>
    )
}