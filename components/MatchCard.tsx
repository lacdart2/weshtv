'use client'

import { useState } from 'react'
import type { Match } from '@/lib/matches'
import { type Region, getChannelsForMatch } from '@/lib/channels'
import { getAllTimes, isLateNight, isFeaturedMatch } from '@/lib/utils'
import Crest from './Crest'
import LiveDot from './LiveDot'
import ChannelPill from './ChannelPill'
import TimeTooltip from './TimeTooltip'

export default function MatchCard({ match, region }: {
    match: Match
    region: Region
}) {
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

    function shareMatch() {
        const text = `⚽ ${match.homeTeam.short} vs ${match.awayTeam.short}\n🕐 ${t.local}${lateNight ? ' 🌙' : ''}\n📺 ${channels[0]}\n👉 weshtv.vercel.app`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    function copyMatch() {
        navigator.clipboard.writeText(
            `${match.homeTeam.short} vs ${match.awayTeam.short} · ${t.local} · ${channels[0]}`
        )
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // TBD — knockout stage not yet determined
    if (!match.homeTeam.short && !match.awayTeam.short) {
        return (
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
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
                background: featured ? 'rgba(46,204,113,0.05)' : 'var(--surface)',
                border: featured
                    ? '1px solid rgba(46,204,113,0.3)'
                    : live
                        ? '1px solid rgba(231,76,60,0.3)'
                        : '1px solid var(--border)',
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: featured
                    ? '0 4px 24px rgba(46,204,113,0.08)'
                    : '0 2px 12px rgba(0,0,0,0.4)',
            }}>

                {/* Top accent bar */}
                {featured && (
                    <div style={{ height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
                )}

                {/* HEADER — group · badges */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px 0', gap: 8,
                }}>
                    <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {match.group?.replace(/_/g, ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {live && <LiveDot />}
                        {lateNight && !finished && (
                            <span style={{
                                fontSize: 10, color: 'var(--red)', fontWeight: 600,
                                background: 'rgba(231,76,60,0.1)', padding: '1px 6px',
                                borderRadius: 4, border: '1px solid rgba(231,76,60,0.2)',
                            }}>
                                🌙 Late night
                            </span>
                        )}
                        {t.nextDay && !live && (
                            <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>+1 day</span>
                        )}
                    </div>
                </div>

                {/* MAIN — home | time+score | away */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center', padding: '12px 14px 10px', gap: 8,
                }}>

                    {/* HOME */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 48, height: 48,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--surface2)', borderRadius: 10, padding: 6,
                            border: '1px solid #252525',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                        }}>
                            <Crest src={match.homeTeam.flag} alt={match.homeTeam.name} size={36} />
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 800,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text)', textAlign: 'center',
                            fontFamily: 'var(--font-barlow)',
                        }}>
                            {match.homeTeam.short}
                        </span>
                    </div>

                    {/* CENTER */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80 }}>
                        <button
                            onClick={() => setShowTimes(v => !v)}
                            style={{
                                background: showTimes ? 'var(--accent-dim)' : 'var(--surface2)',
                                border: showTimes ? '1px solid rgba(46,204,113,0.4)' : '1px solid #252525',
                                borderRadius: 8, padding: '6px 14px',
                                cursor: 'pointer', transition: 'all 0.15s',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                            }}
                        >
                            <span style={{
                                fontSize: 16, fontWeight: 800,
                                fontVariantNumeric: 'tabular-nums',
                                color: showTimes ? 'var(--accent)' : 'var(--text)',
                                letterSpacing: '0.02em',
                                fontFamily: 'var(--font-barlow)',
                            }}>
                                {live
                                    ? `${match.score.home ?? 0} : ${match.score.away ?? 0}`
                                    : hasScore
                                        ? `${match.score.home} : ${match.score.away}`
                                        : t.local}
                            </span>
                        </button>
                        <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {live ? 'live' : finished ? 'full time' : 'ko · tap'}
                        </span>
                    </div>

                    {/* AWAY */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 48, height: 48,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--surface2)', borderRadius: 10, padding: 6,
                        }}>
                            <Crest src={match.awayTeam.flag} alt={match.awayTeam.name} size={36} />
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 800,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text)', textAlign: 'center',
                            fontFamily: 'var(--font-barlow)',
                        }}>
                            {match.awayTeam.short}
                        </span>
                    </div>
                </div>

                {/* FOOTER — channels + share */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px 10px', gap: 8,
                    borderTop: '1px solid #181818',
                    background: '#0f0f0f',
                    flexWrap: 'wrap',
                }}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        {channels.map(ch => <ChannelPill key={ch} name={ch} region={region} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        <button onClick={shareMatch} style={{
                            background: 'rgba(37,211,102,0.08)',
                            border: '1px solid rgba(37,211,102,0.2)',
                            borderRadius: 5, padding: '3px 8px',
                            fontSize: 10, cursor: 'pointer',
                            color: '#25d366', fontWeight: 600,
                        }}>
                            WA
                        </button>
                        <button onClick={copyMatch} style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 5, padding: '3px 8px',
                            fontSize: 10, cursor: 'pointer',
                            color: copied ? 'var(--accent)' : '#555',
                            fontWeight: 600,
                        }}>
                            {copied ? '✓' : '⎘'}
                        </button>
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