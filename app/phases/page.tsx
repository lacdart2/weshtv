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
    { key: 'LAST_32', label: 'R32', full: 'Seizièmes de finale' },
    { key: 'LAST_16', label: 'R16', full: 'Huitièmes de finale' },
    { key: 'QUARTER_FINALS', label: 'QF', full: 'Quarts de finale' },
    { key: 'SEMI_FINALS', label: 'SF', full: 'Demi-finales' },
    { key: 'THIRD_PLACE', label: '3e', full: 'Match pour la 3e place' },
    { key: 'FINAL', label: 'Finale', full: 'Finale' },
]

const KNOCKOUT_SLOT_PATHS: Record<string, { home: string; away: string }> = {
    '53452545': { home: '2e Groupe A', away: '2e Groupe B' },
    '53452557': { home: '1er Groupe C', away: '2e Groupe F' },
    '53452541': { home: '1er Groupe E', away: 'Meilleur 3e des groupes A/B/C/D/F' },
    '53452547': { home: '1er Groupe F', away: '2e Groupe C' },
    '53452561': { home: '2e Groupe E', away: '2e Groupe I' },
    '53452543': { home: '1er Groupe I', away: 'Meilleur 3e des groupes C/D/F/G/H' },
    '53452563': { home: '1er Groupe A', away: 'Meilleur 3e des groupes C/E/F/H/I' },
    '53452565': { home: '1er Groupe L', away: 'Meilleur 3e des groupes E/H/I/J/K' },
    '53452555': { home: '1er Groupe G', away: 'Meilleur 3e des groupes A/E/H/I/J' },
    '53452553': { home: '1er Groupe D', away: 'Meilleur 3e des groupes B/E/F/I/J' },
    '53452551': { home: '1er Groupe H', away: '2e Groupe J' },
    '53452549': { home: '2e Groupe K', away: '2e Groupe L' },
    '53452505': { home: '1er Groupe B', away: 'Meilleur 3e des groupes E/F/G/I/J' },
    '53452503': { home: '2e Groupe D', away: '2e Groupe G' },
    '53452569': { home: '1er Groupe J', away: '2e Groupe H' },
    '53452507': { home: '1er Groupe K', away: 'Meilleur 3e des groupes D/E/I/J/L' },
}

type TeamDisplay = {
    flag: string
    title: string
    subtitle: string
    isKnownTeam: boolean
}

function detectRegion(): Region {
    if (typeof window === 'undefined') return 'dz'

    const saved = localStorage.getItem('weshtv-region')
    if (saved && saved in REGIONS) return saved as Region

    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Oslo' ? 'no' : 'dz'
}

function cleanPlaceholderName(value?: string | null): string {
    if (!value) return ''

    return value
        .replace(/^TBD\s*/i, '')
        .replace(/[()]/g, '')
        .replace(/^1st Group/i, 'Winner Group')
        .replace(/^2nd Group/i, 'Runner-up Group')
        .replace(/^3rd Group/i, 'Best 3rd-place Group')
        .replace(/_/g, ' ')
        .trim()
}

function getFallbackPath(round: string): string {
    if (round === 'LAST_32') return 'Équipe qualifiée'
    if (round === 'LAST_16') return 'Vainqueur des seizièmes'
    if (round === 'QUARTER_FINALS') return 'Vainqueur des huitièmes'
    if (round === 'SEMI_FINALS') return 'Vainqueur du quart'
    if (round === 'THIRD_PLACE') return 'Perdant de demi-finale'
    if (round === 'FINAL') return 'Vainqueur de demi-finale'
    return 'À confirmer'
}

function getTeamDisplay(
    team: Match['homeTeam'],
    round: string,
    matchId: string | number,
    side: 'home' | 'away'
): TeamDisplay {
    const short = team.short?.toUpperCase()
    const name = team.name

    const knownTeam =
        Boolean(short) &&
        short !== 'TBD' &&
        short !== 'NULL' &&
        short !== 'N/A'

    if (knownTeam) {
        return {
            flag: getTeamFlag(short) ?? '🏳️',
            title: short ?? 'TBD',
            subtitle: name || 'Qualified team',
            isKnownTeam: true,
        }
    }

    const apiPlaceholder = cleanPlaceholderName(name)
    const mappedPath = KNOCKOUT_SLOT_PATHS[String(matchId)]?.[side]
    const fallback = apiPlaceholder || mappedPath || getFallbackPath(round)

    return {
        flag: '🏆',
        title: fallback,
        subtitle: 'En attente des résultats de groupe',
        isKnownTeam: false,
    }
}

function formatMatchDate(utcDate: string): string {
    return new Date(utcDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    })
}


export default function PhasesPage() {
    const [allMatches, setAllMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState<Region>('dz')
    const [activeRound, setActiveRound] = useState('LAST_32')

    useEffect(() => {
        setRegion(detectRegion())
    }, [])

    useEffect(() => {
        fetch('/api/matches')
            .then((response) => response.json())
            .then((data) => setAllMatches(data.matches ?? MOCK_MATCHES))
            .catch(() => setAllMatches(MOCK_MATCHES))
            .finally(() => setLoading(false))
    }, [])

    function handleRegionChange(nextRegion: Region) {
        setRegion(nextRegion)
        localStorage.setItem('weshtv-region', nextRegion)
    }

    const knockoutMatches = useMemo(
        () => allMatches.filter((match) => match.stage !== 'GROUP_STAGE'),
        [allMatches]
    )

    const availableRounds = useMemo(
        () => ROUNDS.filter((round) => knockoutMatches.some((match) => match.stage === round.key)),
        [knockoutMatches]
    )

    const roundMatches = useMemo(
        () =>
            knockoutMatches
                .filter((match) => match.stage === activeRound)
                .sort(
                    (a, b) =>
                        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
                ),
        [knockoutMatches, activeRound]
    )

    useEffect(() => {
        if (
            availableRounds.length > 0 &&
            !availableRounds.find((round) => round.key === activeRound)
        ) {
            setActiveRound(availableRounds[0].key)
        }
    }, [availableRounds, activeRound])

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--black)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Navbar
                region={region}
                source="api"
                loading={false}
                onRegionChange={handleRegionChange}
            />

            <main
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    width: '100%',
                    flex: 1,
                    padding: '20px 16px',
                }}
            >
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h1
                        style={{
                            fontFamily: 'var(--font-barlow)',
                            fontSize: 28,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            color: 'var(--text)',
                            marginBottom: 4,
                        }}
                    >
                        Phases Finales
                    </h1>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                        }}
                    >
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Seizièmes → Finale · Horaires selon votre région
                        </p>

                        <Link
                            href="/groups"
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--accent)',
                                textDecoration: 'none',
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: '1px solid rgba(46,204,113,0.3)',
                                background: 'var(--accent-dim)',
                            }}
                        >
                            ← Groupes
                        </Link>
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            fontSize: 12,
                            lineHeight: 1.5,
                            fontFamily: 'var(--font-inter)',
                        }}
                    >
                        Les équipes apparaîtront ici dès que leur classement de groupe sera confirmé.
                        En attendant, chaque carte montre le chemin de qualification, par exemple
                        “1er Groupe A” ou “2e Groupe B”.
                    </div>
                </div>

                {/* Round tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                        marginBottom: 20,
                    }}
                >
                    {ROUNDS.map((round) => {
                        const hasMatches = knockoutMatches.some(
                            (match) => match.stage === round.key
                        )

                        return (
                            <button
                                key={round.key}
                                onClick={() => hasMatches && setActiveRound(round.key)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    border:
                                        activeRound === round.key
                                            ? '1px solid rgba(46,204,113,0.4)'
                                            : '1px solid var(--border)',
                                    background:
                                        activeRound === round.key
                                            ? 'var(--accent-dim)'
                                            : 'transparent',
                                    color:
                                        activeRound === round.key
                                            ? 'var(--accent)'
                                            : hasMatches
                                                ? 'var(--text-muted)'
                                                : 'var(--border)',
                                    cursor: hasMatches ? 'pointer' : 'default',
                                    fontFamily: 'var(--font-barlow)',
                                    letterSpacing: '0.06em',
                                    opacity: hasMatches ? 1 : 0.4,
                                }}
                            >
                                {round.label}
                            </button>
                        )
                    })}
                </div>

                {/* Round title */}
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'var(--accent)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-barlow)',
                        marginBottom: 12,
                    }}
                >
                    {ROUNDS.find((round) => round.key === activeRound)?.full}
                    {roundMatches.length > 0 && (
                        <span
                            style={{
                                color: 'var(--text-muted)',
                                fontWeight: 400,
                                marginLeft: 8,
                                fontSize: 11,
                            }}
                        >
                            · {roundMatches.length} matches
                        </span>
                    )}
                </div>

                {loading && (
                    <div
                        style={{
                            padding: '60px 0',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: 13,
                        }}
                    >
                        Loading...
                    </div>
                )}

                {!loading && roundMatches.length === 0 && (
                    <div
                        style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: 14,
                        }}
                    >
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
                        Les matchs seront confirmés après la phase de groupes.
                    </div>
                )}

                {/* Match cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roundMatches.map((match, index) => {
                        const t = getAllTimes(match.utcDate, region)
                        const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
                        const finished = match.status === 'FINISHED'
                        const hasScore = match.score.home !== null

                        const home = getTeamDisplay(match.homeTeam, activeRound, match.id, 'home')
                        const away = getTeamDisplay(match.awayTeam, activeRound, match.id, 'away')
                        return (
                            <Link
                                key={match.id}
                                href={`/match/${match.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    style={{
                                        background: 'var(--surface)',
                                        border: live
                                            ? '1px solid rgba(231,76,60,0.35)'
                                            : '1px solid var(--border)',
                                        borderRadius: 12,
                                        padding: '14px 16px',
                                        boxShadow: 'var(--card-shadow)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(event) =>
                                        (event.currentTarget.style.background = 'var(--surface2)')
                                    }
                                    onMouseLeave={(event) =>
                                        (event.currentTarget.style.background = 'var(--surface)')
                                    }
                                >
                                    {/* Top meta */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 10,
                                            marginBottom: 12,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: live ? 'var(--red)' : 'var(--text-muted)',
                                                fontWeight: 700,
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                fontFamily: 'var(--font-inter)',
                                            }}
                                        >
                                            {live ? '● En direct' : `Match ${index + 1} · ${ROUNDS.find((round) => round.key === activeRound)?.full}`}
                                        </span>

                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--text-muted)',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                fontFamily: 'var(--font-inter)',
                                            }}
                                        >
                                            {formatMatchDate(match.utcDate)} · {t.local}
                                        </span>
                                    </div>

                                    {/* Main matchup */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                                            alignItems: 'center',
                                            gap: 12,
                                        }}
                                    >
                                        <TeamSlot team={home} align="left" />

                                        <div
                                            style={{
                                                minWidth: 86,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 5,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: hasScore ? 22 : 20,
                                                    fontWeight: 900,
                                                    color: 'var(--text)',
                                                    fontFamily: 'var(--font-barlow)',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {hasScore ? `${match.score.home} : ${match.score.away}` : t.local}
                                            </div>

                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: 'var(--text-muted)',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    fontFamily: 'var(--font-inter)',
                                                }}
                                            >
                                                {formatMatchDate(match.utcDate)}
                                            </span>

                                            {!hasScore && (
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: 'var(--accent)',
                                                        background: 'var(--accent-dim)',
                                                        border: '1px solid var(--accent-mid)',
                                                        padding: '2px 8px',
                                                        borderRadius: 999,
                                                        fontWeight: 800,
                                                        fontFamily: 'var(--font-inter)',
                                                        letterSpacing: '0.08em',
                                                    }}
                                                >
                                                    VS
                                                </span>
                                            )}
                                        </div>

                                        <TeamSlot team={away} align="right" />
                                    </div>

                                </div>
                            </Link>
                        )
                    })}
                </div>

                <div style={{ height: 80 }} />
            </main>

            <Footer />
            <BottomNav />
        </div>
    )
}

function TeamSlot({ team, align }: { team: TeamDisplay; align: 'left' | 'right' }) {
    return (
        <div
            style={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: align === 'left' ? 'flex-start' : 'flex-end',
                textAlign: align,
                gap: 4,
            }}
        >
            <span
                style={{
                    fontSize: team.isKnownTeam ? 24 : 20,
                    lineHeight: 1,
                }}
            >
                {team.flag}
            </span>

            <span
                style={{
                    fontSize: team.isKnownTeam ? 15 : 13,
                    fontWeight: 900,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-barlow)',
                    letterSpacing: '0.04em',
                    textTransform: team.isKnownTeam ? 'uppercase' : 'none',
                    lineHeight: 1.15,
                    maxWidth: 145,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}
            >
                {team.title}
            </span>

            <span
                style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-inter)',
                    lineHeight: 1.2,
                    maxWidth: 145,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {team.subtitle}
            </span>
        </div>
    )
}