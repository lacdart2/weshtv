'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, type Region } from '@/lib/channels'
import { getAllTimes } from '@/lib/utils'
import { getTeamFlag } from '@/lib/teamFlags'
import BottomNav from '@/components/BottomNav'
import Navbar from '@/components/NavBar'
import Footer from '@/components/Footer'

const ROUNDS = [
    { key: 'LAST_32', label: 'R32', full: 'Round of 32' },
    { key: 'LAST_16', label: 'R16', full: 'Round of 16' },
    { key: 'QUARTER_FINALS', label: 'QF', full: 'Quarter-finals' },
    { key: 'SEMI_FINALS', label: 'SF', full: 'Semi-finals' },
    { key: 'THIRD_PLACE', label: '3rd', full: '3rd Place' },
    { key: 'FINAL', label: 'Finale', full: 'Finale' },
]

function detectRegion(): Region {
    if (typeof window === 'undefined') return 'dz'
    const saved = localStorage.getItem('weshtv-region')
    if (saved && saved in REGIONS) return saved as Region
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Oslo' ? 'no' : 'dz'
}

export default function PhasesPage() {
    const [allMatches, setAllMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState<Region>('dz')
    const [activeRound, setActiveRound] = useState('LAST_32')

    useEffect(() => { setRegion(detectRegion()) }, [])

    useEffect(() => {
        fetch('/api/matches')
            .then(r => r.json())
            .then(data => setAllMatches(data.matches ?? MOCK_MATCHES))
            .catch(() => setAllMatches(MOCK_MATCHES))
            .finally(() => setLoading(false))
    }, [])

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

    // Filter knockout matches only
    const knockoutMatches = useMemo(() =>
        allMatches.filter(m => m.stage !== 'GROUP_STAGE'),
        [allMatches]
    )

    // Available rounds that have matches
    const availableRounds = useMemo(() =>
        ROUNDS.filter(r => knockoutMatches.some(m => m.stage === r.key)),
        [knockoutMatches]
    )

    const roundMatches = useMemo(() =>
        knockoutMatches
            .filter(m => m.stage === activeRound)
            .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()),
        [knockoutMatches, activeRound]
    )

    // Auto-select first available round
    useEffect(() => {
        if (availableRounds.length > 0 && !availableRounds.find(r => r.key === activeRound)) {
            setActiveRound(availableRounds[0].key)
        }
    }, [availableRounds])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column' }}>
            <Navbar region={region} source="api" loading={false} onRegionChange={handleRegionChange} />

            <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', flex: 1, padding: '20px 16px' }}>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-barlow)', fontSize: 28, fontWeight: 900,
                        textTransform: 'uppercase', color: 'var(--text)', marginBottom: 4,
                    }}>
                        Phases Finales
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Round of 32 → Finale · Jul 19 · MetLife Stadium
                        </p>
                        <Link href="/groups" style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                            textDecoration: 'none', padding: '4px 10px', borderRadius: 6,
                            border: '1px solid rgba(46,204,113,0.3)',
                            background: 'var(--accent-dim)',
                        }}>
                            ← Groupes
                        </Link>
                    </div>
                </div>

                {/* Round tabs */}
                <div style={{
                    display: 'flex', gap: 6, flexWrap: 'wrap',
                    marginBottom: 20,
                }}>
                    {ROUNDS.map(r => {
                        const hasMatches = knockoutMatches.some(m => m.stage === r.key)
                        return (
                            <button
                                key={r.key}
                                onClick={() => hasMatches && setActiveRound(r.key)}
                                style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    fontSize: 11, fontWeight: 700,
                                    border: activeRound === r.key
                                        ? '1px solid rgba(46,204,113,0.4)'
                                        : '1px solid var(--border)',
                                    background: activeRound === r.key
                                        ? 'var(--accent-dim)' : 'transparent',
                                    color: activeRound === r.key
                                        ? 'var(--accent)'
                                        : hasMatches ? 'var(--text-muted)' : 'var(--border)',
                                    cursor: hasMatches ? 'pointer' : 'default',
                                    fontFamily: 'var(--font-barlow)',
                                    letterSpacing: '0.06em',
                                    opacity: hasMatches ? 1 : 0.4,
                                }}
                            >
                                {r.label}
                            </button>
                        )
                    })}
                </div>

                {/* Round title */}
                <div style={{
                    fontSize: 13, fontWeight: 800, color: 'var(--accent)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-barlow)', marginBottom: 12,
                }}>
                    {ROUNDS.find(r => r.key === activeRound)?.full}
                    {roundMatches.length > 0 && (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
                            · {roundMatches.length} matches
                        </span>
                    )}
                </div>

                {loading && (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        Loading...
                    </div>
                )}

                {/* Match cards */}
                {!loading && roundMatches.length === 0 && (
                    <div style={{
                        padding: '60px 20px', textAlign: 'center',
                        color: 'var(--text-muted)', fontSize: 14,
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
                        Matchs à confirmer après la phase de groupes
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roundMatches.map(match => {
                        const t = getAllTimes(match.utcDate, region)
                        const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
                        const finished = match.status === 'FINISHED'
                        const hasScore = match.score.home !== null
                        const homeTLA = match.homeTeam.short
                        const awayTLA = match.awayTeam.short
                        const homeFlag = getTeamFlag(homeTLA)
                        const awayFlag = getTeamFlag(awayTLA)

                        return (
                            <Link key={match.id} href={`/match/${match.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: 'var(--surface)',
                                    border: live
                                        ? '1px solid rgba(231,76,60,0.35)'
                                        : '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '14px 16px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto 1fr',
                                    alignItems: 'center',
                                    gap: 12,
                                    boxShadow: 'var(--card-shadow)',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                                >
                                    {/* Home team */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 28, lineHeight: 1 }}>{homeFlag ?? '🏳️'}</span>
                                        <span style={{
                                            fontSize: 13, fontWeight: 800,
                                            color: 'var(--text)', fontFamily: 'var(--font-barlow)',
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                        }}>
                                            {homeTLA ?? 'TBD'}
                                        </span>
                                    </div>

                                    {/* Center — score / time */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 90 }}>
                                        {live && (
                                            <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>● LIVE</span>
                                        )}
                                        <div style={{
                                            fontSize: hasScore ? 22 : 18,
                                            fontWeight: 900, color: 'var(--text)',
                                            fontFamily: 'var(--font-barlow)',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}>
                                            {hasScore
                                                ? `${match.score.home} : ${match.score.away}`
                                                : t.local}
                                        </div>
                                        <span style={{
                                            fontSize: 9, color: 'var(--text-muted)',
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                        }}>
                                            {finished ? 'Terminé' : live ? 'En cours' : new Date(match.utcDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Away team */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 28, lineHeight: 1 }}>{awayFlag ?? '🏳️'}</span>
                                        <span style={{
                                            fontSize: 13, fontWeight: 800,
                                            color: 'var(--text)', fontFamily: 'var(--font-barlow)',
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                        }}>
                                            {awayTLA ?? 'TBD'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                <div style={{ height: 80 }} />
            </div>

            <Footer />
            {/*   <BottomNav region={region} onRegionToggle={toggleRegion} /> */}
            <BottomNav />
        </div>
    )
}