'use client'

import { useMemo } from 'react'
import type { Match } from '@/lib/matches'
import { getChannelsForMatch, type Region } from '@/lib/channels'
import { getAllTimes } from '@/lib/utils'
import { getTeamFlag } from '@/lib/teamFlags'
import { useRouter } from 'next/navigation'

interface Props {
    matches: Match[]
    region: Region
}

export default function NextFeaturedBanner({ matches, region }: Props) {
    const router = useRouter()
    const now = new Date()

    const banner = useMemo(() => {
        const currentTime = new Date()
        const sorted = [...matches].sort(
            (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        )
        const live = sorted.find(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
        if (live) return { type: 'live' as const, match: live }

        const soon = sorted.find(m => {
            const diff = new Date(m.utcDate).getTime() - currentTime.getTime()
            return diff > 0 && diff <= 3 * 3600000 && m.status === 'SCHEDULED'
        })
        if (soon) return { type: 'soon' as const, match: soon }

        const next = sorted.find(m =>
            new Date(m.utcDate) > currentTime && m.status !== 'FINISHED'
        )
        if (next) return { type: 'next' as const, match: next }

        return null
    }, [matches])

    if (!banner) return null

    const { type, match } = banner
    const t = getAllTimes(match.utcDate, region)
    const channels = getChannelsForMatch(region, match.homeTeam.short, match.awayTeam.short, match.stage)

    const diffMs = new Date(match.utcDate).getTime() - now.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffM = Math.floor((diffMs % 3600000) / 60000)
    const timeUntil = diffH > 24
        ? `in ${Math.floor(diffH / 24)}d ${diffH % 24}h`
        : diffH > 0
            ? `in ${diffH}h ${diffM}m`
            : diffM > 0
                ? `in ${diffM}m`
                : 'now'

    const isLive = type === 'live'

    // Ticker colors — red for live, green for upcoming
    const bg = isLive ? '#c0392b' : 'var(--banner-bg)'
    const tagBg = isLive ? '#a93226' : 'var(--banner-tag-bg)'
    const textColor = isLive ? '#fff' : 'var(--banner-text)'
    const mutedColor = isLive ? 'rgba(255,255,255,0.7)' : 'var(--banner-muted)'
    const tagLabel = isLive ? '🔴 LIVE' : type === 'soon' ? `⚽ ${timeUntil}` : `NEXT MATCH · ${timeUntil}`

    return (
        <div
            onClick={() => router.push(`/match/${match.id}`)}
            style={{
                background: bg,
                borderBottom: `2px solid ${isLive ? '#a93226' : 'rgba(46,204,113,0.15)'}`,
                cursor: 'pointer',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'stretch', height: 46 }}>

                {/* Tag */}
                <div style={{
                    background: tagBg,
                    display: 'flex', alignItems: 'center',
                    padding: '0 12px', flexShrink: 0,
                    gap: 5,
                    fontSize: 10, fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-inter)',
                }}>
                    {!isLive && (
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#fff',
                            display: 'inline-block',
                            animation: 'bannerPulse 1.6s ease-in-out infinite',
                        }} />
                    )}
                    <span className="banner-tag-label">{tagLabel}</span>
                    <span className="banner-tag-label-short" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                        {isLive ? '🔴 LIVE' : 'NEXT'}
                    </span>
                </div>

                {/* Teams + time */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0 14px', gap: 10, flex: 1, minWidth: 0,
                }}>
                    <span className="banner-teams" style={{
                        fontSize: 15, fontWeight: 800,
                        color: textColor,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        fontFamily: 'var(--font-barlow)',
                    }}>
                        {getTeamFlag(match.homeTeam.short)} {match.homeTeam.short}
                        {' '}
                        {isLive
                            ? `${match.score.home ?? 0}:${match.score.away ?? 0}`
                            : 'vs'
                        }
                        {' '}
                        {getTeamFlag(match.awayTeam.short)} {match.awayTeam.short}
                    </span>
                    <span style={{ fontSize: 12, color: mutedColor, flexShrink: 0 }}>·</span>
                    <span className="banner-time" style={{
                        fontSize: 16, fontWeight: 900,
                        color: textColor, flexShrink: 0,
                        fontFamily: 'var(--font-barlow)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {isLive ? 'LIVE' : t.local}
                    </span>
                </div>

                {/* Channel + arrow */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0 12px', gap: 6, flexShrink: 0,
                }}>
                    {channels[0] && (
                        <span style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '3px 8px', borderRadius: 4,
                            background: isLive ? 'rgba(255,255,255,0.2)' : 'var(--banner-channel-bg)',
                            color: isLive ? '#fff' : 'var(--banner-channel-text)',
                            fontFamily: 'var(--font-inter)',
                            whiteSpace: 'nowrap',
                        }}>
                            {channels[0]}
                        </span>
                    )}
                    <span style={{ fontSize: 14, color: textColor, fontWeight: 700 }}>→</span>
                </div>
            </div>

            <style>{`
                @keyframes bannerPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }
            `}</style>
        </div>
    )
}