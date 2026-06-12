'use client'

import { useMemo } from 'react'
import type { Match } from '@/lib/matches'
import { getChannelsForMatch, getChannelColor, type Region } from '@/lib/channels'
import { getAllTimes, isLateNight, getDateKeyInTimezone, TIMEZONES } from '@/lib/utils'
import { getTeamFlag } from '@/lib/teamFlags'
import { useRouter } from 'next/navigation'

function ChannelPill({ name, region }: { name: string; region: Region }) {
    const color = getChannelColor(region, name)
    return (
        <span style={{
            padding: '2px 7px', borderRadius: 4,
            fontSize: 10, fontWeight: 600,
            background: `${color}18`, color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap',
        }}>
            {name}
        </span>
    )
}


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

        const live = sorted.find(m =>
            m.status === 'IN_PLAY' || m.status === 'PAUSED'
        )
        if (live) return { type: 'live' as const, match: live }

        const soon = sorted.find(m => {
            const diff = new Date(m.utcDate).getTime() - currentTime.getTime()
            return diff > 0 && diff <= 3 * 3600000 && m.status === 'SCHEDULED'
        })
        if (soon) return { type: 'soon' as const, match: soon }

        const next = sorted.find(m => {
            const isUpcoming = new Date(m.utcDate) > currentTime
            return isUpcoming && m.status !== 'FINISHED'
        })
        if (next) return { type: 'next' as const, match: next }

        return null
    }, [matches])
    if (!banner) return null

    const { type, match } = banner
    const t = getAllTimes(match.utcDate, region)
    const date = getDateKeyInTimezone(match.utcDate, TIMEZONES[region])
    const channels = getChannelsForMatch(region, match.homeTeam.short, match.awayTeam.short, match.stage)
    const lateNight = isLateNight(match.utcDate, region)

    // Time until match
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

    // Label + color per type
    const config = {
        live: {
            label: '🔴 LIVE NOW',
            color: '#e74c3c',
            bg: 'rgba(231,76,60,0.06)',
            border: 'rgba(231,76,60,0.2)',
        },
        soon: {
            label: `⚽ Starting ${timeUntil}`,
            color: '#f39c12',
            bg: 'rgba(243,156,18,0.06)',
            border: 'rgba(243,156,18,0.2)',
        },
        next: {
            label: `Next match · ${timeUntil}`,
            color: 'var(--accent)',
            bg: 'rgba(46,204,113,0.06)',
            border: 'rgba(46,204,113,0.15)',
        },
    }[type]

    return (
        <div
            onClick={() => router.push(`/match/${match.id}`)}
            style={{
                padding: '10px 20px',
                background: config.bg,
                borderBottom: `1px solid ${config.border}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
            }}
        >
            {/* LEFT — label + teams */}
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: config.color, marginBottom: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {config.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {getTeamFlag(match.homeTeam.short)} {match.homeTeam.short} vs{' '}
                    {getTeamFlag(match.awayTeam.short)} {match.awayTeam.short}
                    {lateNight && type !== 'live' && (
                        <span style={{ marginLeft: 6 }}>🌙</span>
                    )}
                </div>
            </div>

            {/* RIGHT — time + channel + arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: 14, fontWeight: 800,
                        color: type === 'live' ? '#e74c3c' : 'var(--text)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {type === 'live' ? `${match.score.home ?? 0} : ${match.score.away ?? 0}` : t.local}
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>
                        {type === 'live' ? 'in progress' : new Date(match.utcDate).toLocaleDateString('en', {
                            weekday: 'short', day: 'numeric', month: 'short',
                        })}
                    </div>
                </div>
                {channels[0] && <ChannelPill name={channels[0]} region={region} />}
                <span style={{ fontSize: 14, color: config.color }}>→</span>
            </div>
        </div>
    )
}

