'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { TEAM_FLAGS } from '@/lib/teamFlags'

// Deduplicated primary codes only
const ALL_TEAMS = [
    'ALG', 'TUN', 'MAR', 'NOR', 'EGY',
    'FRA', 'BRA', 'ARG', 'ESP', 'GER',
    'ENG', 'POR', 'USA', 'MEX', 'CAN',
    'JPN', 'KOR', 'AUS', 'NED', 'BEL',
    'SUI', 'CRO', 'SEN', 'URY', 'COL',
    'ECU', 'PAR', 'QAT', 'IRN', 'DEN',
    'RSA', 'GHA', 'CMR', 'CIV', 'TUR',
    'POL', 'SRB', 'UKR', 'HAI', 'JAM',
    'CPV', 'CUW', 'BIH', 'UZB', 'JOR',
    'IRQ', 'NZL', 'SCO',
]

interface Props {
    open: boolean
    onClose: () => void
    myTeams: string[]
    onToggle: (code: string) => void
}

export default function MyTeamsPicker({ open, onClose, myTeams, onToggle }: Props) {
    // Close on backdrop click / escape key
    useEffect(() => {
        if (!open) return
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Sheet */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '20px 16px 40px',
                maxHeight: '80vh',
                overflowY: 'auto',
            }}>
                {/* Handle */}
                <div style={{
                    width: 36, height: 4, borderRadius: 2,
                    background: 'var(--border)',
                    margin: '0 auto 20px',
                }} />

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 6,
                }}>
                    <div>
                        <h2 style={{
                            fontFamily: 'var(--font-barlow)', fontSize: 20,
                            fontWeight: 900, textTransform: 'uppercase',
                            color: 'var(--text)', letterSpacing: '0.04em',
                        }}>
                            My Teams
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {myTeams.length === 0
                                ? 'Tap teams to follow them'
                                : `${myTeams.length} team${myTeams.length > 1 ? 's' : ''} selected`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--surface2)', border: '1px solid var(--border)',
                            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Team grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 8, marginTop: 16,
                }}>
                    {ALL_TEAMS.map(code => {
                        const flag = TEAM_FLAGS[code]
                        const selected = myTeams.includes(code)
                        return (
                            <button
                                key={code}
                                onClick={() => onToggle(code)}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 4, padding: '10px 6px',
                                    borderRadius: 10, cursor: 'pointer',
                                    border: selected
                                        ? '1.5px solid var(--accent)'
                                        : '1px solid var(--border)',
                                    background: selected ? 'var(--accent-dim)' : 'var(--surface2)',
                                    transition: 'all 0.12s',
                                }}
                            >
                                <span style={{ fontSize: 22, lineHeight: 1 }}>{flag ?? '🏳️'}</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: selected ? 'var(--accent)' : 'var(--text-muted)',
                                    fontFamily: 'var(--font-barlow)',
                                    letterSpacing: '0.06em',
                                }}>
                                    {code}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}