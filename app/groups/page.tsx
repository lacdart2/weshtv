'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { REGIONS, type Region } from '@/lib/channels'
import { getTeamFlag } from '@/lib/teamFlags'
import BottomNav from '@/components/BottomNav'
import Navbar from '@/components/NavBar'
import Footer from '@/components/Footer'

interface Standing {
    position: number
    team: { id: number; name: string; shortName: string; tla: string; crest: string }
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
}

interface Group {
    stage: string
    type: string
    group: string
    table: Standing[]
}

function detectRegion(): Region {
    if (typeof window === 'undefined') return 'dz'
    const saved = localStorage.getItem('weshtv-region')
    if (saved && saved in REGIONS) return saved as Region
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Oslo' ? 'no' : 'dz'
}

export default function GroupsPage() {
    const [standings, setStandings] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState<Region>('dz')

    useEffect(() => {
        setRegion(detectRegion())
    }, [])

    useEffect(() => {
        fetch('/api/standings')
            .then(r => r.json())
            .then(data => setStandings(data.standings ?? []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    function handleRegionChange(nextRegion: Region) {
        setRegion(nextRegion)
        localStorage.setItem('weshtv-region', nextRegion)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column' }}>
            <Navbar
                region={region}
                source="api"
                loading={false}
                onRegionChange={handleRegionChange}
            />

            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', flex: 1, padding: '20px 16px' }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-barlow)', fontSize: 28, fontWeight: 900,
                        textTransform: 'uppercase', color: 'var(--text)', marginBottom: 4,
                    }}>
                        Group Standings
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            12 groups · World Cup 2026
                        </p>
                        <Link href="/phases" style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                            textDecoration: 'none', letterSpacing: '0.06em',
                            padding: '4px 10px', borderRadius: 6,
                            border: '1px solid rgba(46,204,113,0.3)',
                            background: 'var(--accent-dim)',
                        }}>
                            Phases Finales →
                        </Link>
                    </div>
                </div>

                {loading && (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        Loading standings...
                    </div>
                )}

                {/* All groups grid */}
                <div className="groups-grid">
                    {!loading && standings.map(group => {
                        const groupLetter = group.group?.replace('GROUP_', 'Group ') ?? ''
                        return (
                            <div key={group.group} style={{ marginBottom: 8 }}>
                                {/* Group title */}
                                <div className="group-title" style={{
                                    fontSize: 14, fontWeight: 900,
                                    color: 'var(--accent)', letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'var(--font-barlow)',
                                    marginBottom: 8,
                                }}>
                                    {groupLetter}
                                </div>

                                {/* Table */}
                                <div style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                }}>
                                    {/* Header */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '18px 1fr 24px 24px 24px 24px 32px 28px',
                                        padding: '6px 10px',
                                        borderBottom: '1px solid var(--border)',
                                        background: 'var(--surface2)',
                                        gap: 2,
                                    }}>
                                        {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'PTS'].map((h, i) => (
                                            <span key={h} style={{
                                                fontSize: 11, fontWeight: 700,
                                                color: h === 'PTS' ? 'var(--accent)' : 'var(--text-muted)',
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                                textAlign: i > 1 ? 'center' : 'left',
                                            }}>
                                                {h}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Rows */}
                                    {group.table.map((row, idx) => {
                                        const flag = getTeamFlag(row.team.tla)
                                        const qualified = idx < 2
                                        return (
                                            <div key={row.team.id} className="group-row"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '18px 1fr 24px 24px 24px 24px 32px 28px',
                                                    padding: '10px 12px',
                                                    gap: 2,
                                                    borderBottom: idx < group.table.length - 1
                                                        ? '1px solid var(--border)' : 'none',
                                                    background: qualified
                                                        ? 'rgba(46,204,113,0.03)' : 'transparent',
                                                    borderLeft: qualified
                                                        ? '2px solid rgba(46,204,113,0.4)'
                                                        : '2px solid transparent',
                                                    alignItems: 'center',
                                                }}>
                                                <span className="group-pos" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {row.position}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                                                    <span className="group-team-flag" style={{ fontSize: 15, flexShrink: 0 }}>{flag ?? '🏳️'}</span>
                                                    <span className="group-team-name" style={{
                                                        fontSize: 13, fontWeight: 700,
                                                        color: 'var(--text)',
                                                        fontFamily: 'var(--font-barlow)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        letterSpacing: '0.04em',
                                                    }}>
                                                        {row.team.tla}
                                                    </span>
                                                </span>
                                                {[row.playedGames, row.won, row.draw, row.lost].map((val, i) => (
                                                    <span key={i} className="group-stat" style={{
                                                        fontSize: 13, color: 'var(--text-dim)',
                                                        textAlign: 'center',
                                                    }}>
                                                        {val}
                                                    </span>
                                                ))}
                                                <span className="group-gd" style={{
                                                    fontSize: 13, textAlign: 'center',
                                                    color: row.goalDifference > 0
                                                        ? 'var(--accent)'
                                                        : row.goalDifference < 0
                                                            ? 'var(--red)'
                                                            : 'var(--text-dim)',
                                                    fontWeight: row.goalDifference !== 0 ? 700 : 400,
                                                }}>
                                                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                                </span>
                                                <span className="group-pts" style={{
                                                    fontSize: 14, fontWeight: 900,
                                                    color: 'var(--text)',
                                                    textAlign: 'center',
                                                    fontFamily: 'var(--font-barlow)',
                                                }}>
                                                    {row.points}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Legend */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    marginTop: 5, paddingLeft: 4,
                                }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: 1,
                                        background: 'rgba(46,204,113,0.4)',
                                    }} />
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        Advance to Round of 32
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {!loading && standings.length === 0 && (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        Standings not available yet.
                    </div>
                )}

                <div style={{ height: 80 }} />
            </div>

            <Footer />
            <BottomNav />
        </div>
    )
}