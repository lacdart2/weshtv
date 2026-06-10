'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import { REGIONS, getChannelsForMatch, getChannelColor, type Region } from '@/lib/channels'
import { getAllTimes, isLateNight, TIMEZONES } from '@/lib/utils'
import { getVenue } from '@/lib/venues'

// ── Weather ────────────────────────────────────────────────
interface Weather {
    temp: number
    condition: string
    icon: string
}

async function fetchWeather(lat: number, lon: number, utcDate: string): Promise<Weather | null> {
    try {
        const date = utcDate.split('T')[0]
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${date}&end_date=${date}`
        )
        const data = await res.json()
        const temp = Math.round(data.daily.temperature_2m_max[0])
        const code = data.daily.weathercode[0]

        const conditions: Record<number, { condition: string; icon: string }> = {
            0: { condition: 'Clear sky', icon: '☀️' },
            1: { condition: 'Mainly clear', icon: '🌤️' },
            2: { condition: 'Partly cloudy', icon: '⛅' },
            3: { condition: 'Overcast', icon: '☁️' },
            45: { condition: 'Foggy', icon: '🌫️' },
            51: { condition: 'Light drizzle', icon: '🌦️' },
            61: { condition: 'Light rain', icon: '🌧️' },
            63: { condition: 'Moderate rain', icon: '🌧️' },
            71: { condition: 'Light snow', icon: '🌨️' },
            80: { condition: 'Rain showers', icon: '🌦️' },
            95: { condition: 'Thunderstorm', icon: '⛈️' },
        }

        const w = conditions[code] ?? { condition: 'Mixed', icon: '🌡️' }
        return { temp, ...w }
    } catch {
        return null
    }
}

// ── Channel pill ────────────────────────────────────────────
function Pill({ name, region }: { name: string; region: Region }) {
    const color = getChannelColor(region, name)
    const reg = REGIONS[region]
    const ch = reg.channels.find((c: { name: string }) => c.name === name)
    return (
        <div style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: `${color}12`,
            border: `1px solid ${color}35`,
            display: 'flex', flexDirection: 'column', gap: 2,
        }}>
            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-barlow)' }}>
                {name}
            </span>
            {ch && (
                <span style={{ fontSize: 10, color: '#666' }}>
                    {ch.type === 'free' ? '🆓 Free to air' : ch.type === 'streaming' ? '📱 Streaming' : '💳 Subscription'}
                </span>
            )}
        </div>
    )
}

// ── Crest ───────────────────────────────────────────────────
function Crest({ src, alt, size }: { src: string; alt: string; size: number }) {
    if (src?.startsWith('http')) {
        return <Image src={src} alt={alt} width={size} height={size} style={{ objectFit: 'contain' }} />
    }
    return <span style={{ fontSize: size * 0.8 }}>{src}</span>
}

// ── Page ────────────────────────────────────────────────────
export default function MatchDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [match, setMatch] = useState<Match | null>(null)
    const [weather, setWeather] = useState<Weather | null>(null)
    const [region] = useState<Region>('dz')

    useEffect(() => {
        fetch('/api/matches')
            .then(r => r.json())
            .then(data => {
                const found = (data.matches as Match[]).find(m => String(m.id) === String(id))
                setMatch(found ?? MOCK_MATCHES.find(m => String(m.id) === String(id)) ?? null)
            })
            .catch(() => {
                setMatch(MOCK_MATCHES.find(m => String(m.id) === String(id)) ?? null)
            })
    }, [id])

    useEffect(() => {
        if (!match) return
        const venue = getVenue(match.venue)
        if (venue) {
            fetchWeather(venue.lat, venue.lon, match.utcDate).then(setWeather)
        }
    }, [match])

    if (!match) return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#444', fontSize: 14 }}>Loading...</span>
        </div>
    )

    const t = getAllTimes(match.utcDate, region)
    const venue = getVenue(match.venue)
    const channels = getChannelsForMatch(region, match.homeTeam.short, match.awayTeam.short, match.stage)
    const lateNight = isLateNight(match.utcDate, region)
    const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const finished = match.status === 'FINISHED'
    const hasScore = match.score.home !== null

    const timeRows = [
        { flag: '🇩🇿', label: 'Algeria', time: t.dz },
        { flag: '🇳🇴', label: 'Norway', time: t.no },
        { flag: '🇺🇸', label: 'USA (East)', time: t.us },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)' }}>

            {/* NAV */}
            <nav style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '0 20px', height: 52,
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0,
                background: 'rgba(9,9,9,0.94)',
                backdropFilter: 'blur(10px)', zIndex: 50,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8, padding: '6px 12px',
                        color: 'var(--text)', fontSize: 13,
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: 6,
                    }}
                >
                    ← Back
                </button>
                <span style={{ fontSize: 12, color: '#555' }}>
                    {match.group?.replace(/_/g, ' ')} · {match.stage?.replace(/_/g, ' ')}
                </span>
            </nav>

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px' }}>

                {/* MATCH HEADER — teams */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '28px 20px 20px',
                    marginBottom: 12,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Top accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

                    {/* Teams */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 20,
                    }}>
                        {/* Home */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 72, height: 72,
                                background: 'var(--surface2)', borderRadius: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #252525',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                padding: 8,
                            }}>
                                <Crest src={match.homeTeam.flag} alt={match.homeTeam.name} size={52} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', fontFamily: 'var(--font-barlow)' }}>
                                    {match.homeTeam.short}
                                </div>
                                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                                    {match.homeTeam.name}
                                </div>
                            </div>
                        </div>

                        {/* Score / VS */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            {hasScore ? (
                                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-barlow)', fontVariantNumeric: 'tabular-nums' }}>
                                    {match.score.home} : {match.score.away}
                                </div>
                            ) : (
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#444', fontFamily: 'var(--font-barlow)' }}>
                                    VS
                                </div>
                            )}
                            <div style={{ fontSize: 10, color: live ? 'var(--red)' : '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: live ? 700 : 400 }}>
                                {live ? '● LIVE' : finished ? 'Full time' : 'Upcoming'}
                            </div>
                        </div>

                        {/* Away */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 72, height: 72,
                                background: 'var(--surface2)', borderRadius: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #252525',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                padding: 8,
                            }}>
                                <Crest src={match.awayTeam.flag} alt={match.awayTeam.name} size={52} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', fontFamily: 'var(--font-barlow)' }}>
                                    {match.awayTeam.short}
                                </div>
                                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                                    {match.awayTeam.name}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date + late night */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>
                            {new Date(match.utcDate).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {lateNight && (
                            <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>🌙 Late night</span>
                        )}
                    </div>
                </div>

                {/* KICKOFF TIMES */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14, overflow: 'hidden',
                    marginBottom: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                }}>
                    <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            Kickoff times
                        </span>
                    </div>
                    {timeRows.map((row, i) => (
                        <div key={row.label} style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderBottom: i < timeRows.length - 1 ? '1px solid #181818' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>{row.flag}</span>
                                <span style={{ fontSize: 13, color: '#888' }}>{row.label}</span>
                            </div>
                            <span style={{
                                fontSize: 18, fontWeight: 800,
                                color: 'var(--text)',
                                fontFamily: 'var(--font-barlow)',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {row.time}
                                {t.nextDay && row.label !== 'USA (East)' && (
                                    <span style={{ fontSize: 10, color: 'var(--red)', marginLeft: 6, fontFamily: 'var(--font-inter)' }}>+1</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CHANNELS */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14, overflow: 'hidden',
                    marginBottom: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                }}>
                    <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            Watch on
                        </span>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {channels.map(ch => <Pill key={ch} name={ch} region={region} />)}
                    </div>
                </div>

                {/* VENUE + WEATHER */}
                {venue && (
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14, overflow: 'hidden',
                        marginBottom: 12,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Venue
                            </span>
                        </div>
                        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-barlow)' }}>
                                    {venue.name}
                                </div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                    📍 {venue.city}, {venue.country}
                                </div>
                                <div style={{ fontSize: 11, color: '#555' }}>
                                    Capacity: {venue.capacity.toLocaleString()}
                                </div>
                            </div>

                            {/* Weather */}
                            {weather && (
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 4,
                                    background: 'var(--surface2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10, padding: '10px 16px',
                                    minWidth: 80, textAlign: 'center',
                                }}>
                                    <span style={{ fontSize: 24 }}>{weather.icon}</span>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-barlow)' }}>
                                        {weather.temp}°C
                                    </span>
                                    <span style={{ fontSize: 10, color: '#666' }}>{weather.condition}</span>
                                </div>
                            )}
                        </div>

                        {/* Google Maps link */}
                        <div style={{ padding: '0 16px 14px' }}>

                            <a href={`https://maps.google.com/?q=${venue.name}+${venue.city}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    fontSize: 12, color: 'var(--accent)',
                                    textDecoration: 'none', fontWeight: 500,
                                }}
                            >
                                View on Google Maps →
                            </a>
                        </div>
                    </div>
                )}

            </div>
        </div >
    )
}