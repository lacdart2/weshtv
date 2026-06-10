'use client'

import { CSSProperties, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Match } from '@/lib/matches'
import { MOCK_MATCHES } from '@/lib/matches'
import {
    REGIONS,
    getChannelsForMatch,
    getChannelColor,
    type Region,
} from '@/lib/channels'
import { getVenueByTeams } from '@/lib/matchVenues'
import { MapPin, Tv, Clock, ChevronLeft, Moon, Wifi } from 'lucide-react'
import { getAllTimes, isLateNight } from '@/lib/utils'
import { getVenue } from '@/lib/venues'

interface Weather {
    temp: number
    condition: string
    icon: string
}

async function fetchWeather(
    lat: number,
    lon: number,
    utcDate: string
): Promise<Weather | null> {
    try {
        const date = utcDate.split('T')[0]

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${date}&end_date=${date}`
        )

        const data = await response.json()

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

        const weather = conditions[code] ?? {
            condition: 'Mixed',
            icon: '🌡️',
        }

        return { temp, ...weather }
    } catch {
        return null
    }
}

export default function MatchDetailPage() {
    const params = useParams()
    const router = useRouter()

    const [match, setMatch] = useState<Match | null>(null)
    const [weather, setWeather] = useState<Weather | null>(null)
    const [region] = useState<Region>('dz')

    const id = Array.isArray(params.id) ? params.id[0] : params.id

    useEffect(() => {
        fetch('/api/matches')
            .then((response) => response.json())
            .then((data) => {
                const found = (data.matches as Match[]).find(
                    (item) => String(item.id) === String(id)
                )

                setMatch(
                    found ??
                    MOCK_MATCHES.find((item) => String(item.id) === String(id)) ??
                    null
                )
            })
            .catch(() => {
                setMatch(
                    MOCK_MATCHES.find((item) => String(item.id) === String(id)) ?? null
                )
            })
    }, [id])

    useEffect(() => {
        if (!match) return

        const venue = getVenue(match.venue) ?? getVenue(match.venue?.split(',')[0])

        if (venue) {
            fetchWeather(venue.lat, venue.lon, match.utcDate).then(setWeather)
        }
    }, [match])

    if (!match) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span style={{ color: '#555', fontSize: 14 }}>Loading...</span>
            </div>
        )
    }

    const t = getAllTimes(match.utcDate, region)
    const venueNameFromTeams = getVenueByTeams(match.homeTeam.short, match.awayTeam.short)
    const venue = getVenue(match.venue) ?? getVenue(venueNameFromTeams ?? '')
    const channels = getChannelsForMatch(
        region,
        match.homeTeam.short,
        match.awayTeam.short,
        match.stage
    )

    const lateNight = isLateNight(match.utcDate, region)
    const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const finished = match.status === 'FINISHED'
    const hasScore = match.score.home !== null

    const timeRows = [
        { flag: '🇩🇿', label: 'Algeria', time: t.dz },
        { flag: '🇳🇴', label: 'Norway', time: t.no },
        { flag: '🇺🇸', label: 'USA East', time: t.us },
    ]

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(circle at top, rgba(46,204,113,0.08), transparent 34%), var(--black)',
            }}
        >
            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '0 20px',
                    height: 52,
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(9,9,9,0.94)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 50,
                }}
            >
                <button
                    onClick={() => {
                        if (window.history.length > 1) {
                            router.back()
                        } else {
                            router.push('/')
                        }
                    }}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '6px 12px',
                        color: 'var(--text)',
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <ChevronLeft size={14} />  Back
                </button>

                <span style={{ fontSize: 12, color: '#555' }}>
                    {match.group?.replace(/_/g, ' ') ||
                        match.stage?.replace(/_/g, ' ')}
                </span>
            </nav>

            <main
                style={{
                    maxWidth: 720,
                    margin: '0 auto',
                    padding: '24px 20px 40px',
                }}
            >
                <section
                    style={{
                        border: live
                            ? '1px solid rgba(231,76,60,0.45)'
                            : '1px solid rgba(46,204,113,0.25)',
                        borderRadius: 18,
                        padding: '30px 20px 22px',
                        marginBottom: 14,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'var(--surface)',
                    }}
                >
                    {/* Stadium background */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 0,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 30%',
                        opacity: 0.12,
                        pointerEvents: 'none',
                    }} />
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
                            right: 12,
                            bottom: -26,
                            zIndex: 1,
                            fontSize: 120,
                            fontWeight: 900,
                            color: 'rgba(255,255,255,0.045)',
                            fontFamily: 'var(--font-barlow)',
                            lineHeight: 1,
                            letterSpacing: '-0.06em',
                            pointerEvents: 'none',
                        }}
                    >
                        2026
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            zIndex: 3,
                            background:
                                'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        }}
                    />

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            textAlign: 'center',
                            marginBottom: 22,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                color: '#777',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                marginBottom: 6,
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            {match.group?.replace(/_/g, ' ') ||
                                match.stage?.replace(/_/g, ' ')}
                        </div>

                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: live
                                    ? 'rgba(231,76,60,0.12)'
                                    : 'rgba(46,204,113,0.08)',
                                border: live
                                    ? '1px solid rgba(231,76,60,0.3)'
                                    : '1px solid rgba(46,204,113,0.2)',
                                color: live ? 'var(--red)' : 'var(--accent)',
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            {live ? '● Live' : finished ? 'Full time' : 'Upcoming'}
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 22,
                        }}
                    >
                        <TeamHero
                            flag={match.homeTeam.flag}
                            name={match.homeTeam.name}
                            shortName={match.homeTeam.short}
                        />

                        <div
                            style={{
                                minWidth: 90,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            {hasScore ? (
                                <div
                                    style={{
                                        fontSize: 34,
                                        fontWeight: 900,
                                        color: 'var(--text)',
                                        fontFamily: 'var(--font-barlow)',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {match.score.home} : {match.score.away}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: 62,
                                        height: 62,
                                        borderRadius: 18,
                                        background: 'rgba(15,15,15,0.85)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#555',
                                        fontSize: 18,
                                        fontWeight: 900,
                                        fontFamily: 'var(--font-barlow)',
                                        boxShadow:
                                            'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 26px rgba(0,0,0,0.35)',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    VS
                                </div>
                            )}

                            <span
                                style={{
                                    fontSize: 10,
                                    color: '#777',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'var(--font-inter)',
                                }}
                            >
                                {hasScore ? 'score' : 'match'}
                            </span>
                        </div>

                        <TeamHero
                            flag={match.awayTeam.flag}
                            name={match.awayTeam.name}
                            shortName={match.awayTeam.short}
                        />
                    </div>

                    <div
                        style={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 10,
                        }}
                    >
                        <InfoCard label="Kickoff" value={t.local} />
                        <InfoCard
                            label="Region"
                            value={REGIONS[region]?.region ?? 'Algeria'}
                        />
                    </div>

                    {lateNight && !finished && (
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 3,
                                marginTop: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: 'rgba(231,76,60,0.1)',
                                border: '1px solid rgba(231,76,60,0.2)',
                                color: 'var(--red)',
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            <Moon size={13} style={{ flexShrink: 0 }} />
                            {' '}Late night match in your selected region
                        </div>
                    )}
                </section>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: 12,
                    }}
                >
                    <Card title="Watch channels">
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                            }}
                        >
                            {channels.map((channel) => (
                                <ChannelPill
                                    key={channel}
                                    name={channel}
                                    region={region}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card title="Times">
                        <div
                            style={{
                                display: 'grid',
                                gap: 8,
                            }}
                        >
                            {timeRows.map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        background: 'var(--surface2)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: '#aaa',
                                            fontSize: 13,
                                        }}
                                    >
                                        <span>{row.flag}</span>
                                        {row.label}
                                    </span>

                                    <strong
                                        style={{
                                            color: 'var(--text)',
                                            fontSize: 14,
                                            fontFamily: 'var(--font-barlow)',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {row.time}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Location">
                        {venue ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <InfoRow label="Stadium" value={venue.name} />
                                <InfoRow label="City" value={venue.city} />
                                <InfoRow label="Country" value={venue.country} />
                                <InfoRow label="Capacity" value={venue.capacity.toLocaleString()} />

                                <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.name + ' ' + venue.city)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 8,
                                        padding: '10px 14px', borderRadius: 10,
                                        background: 'rgba(46,204,113,0.06)',
                                        border: '1px solid rgba(46,204,113,0.2)',
                                        color: 'var(--accent)', fontSize: 13,
                                        fontWeight: 600, textDecoration: 'none',
                                        fontFamily: 'var(--font-inter)', marginTop: 4,
                                    }}
                                >
                                    <MapPin size={14} /> Open in Maps
                                </a>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 0', color: '#555', fontSize: 13,
                                fontFamily: 'var(--font-inter)',
                            }}>
                                <MapPin size={14} color="#555" />
                                Location not yet confirmed — check back closer to the tournament.
                            </div>
                        )}
                    </Card>

                    {weather && (
                        <Card title="Weather">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 900,
                                            color: 'var(--text)',
                                            fontFamily: 'var(--font-barlow)',
                                        }}
                                    >
                                        {weather.temp}°C
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: '#777',
                                        }}
                                    >
                                        {weather.condition}
                                    </div>
                                </div>

                                <div style={{ fontSize: 44 }}>{weather.icon}</div>
                            </div>
                        </Card>
                    )}
                </section>
            </main>
        </div>
    )
}

function TeamHero({
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
                gap: 12,
                minWidth: 0,
            }}
        >
            <div
                style={{
                    width: 82,
                    height: 82,
                    background: 'rgba(15,15,15,0.82)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 26px rgba(0,0,0,0.4)',
                    padding: 10,
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Crest src={flag} alt={name ?? 'Team flag'} size={58} />
            </div>

            <div style={{ textAlign: 'center', minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-barlow)',
                    }}
                >
                    {shortName || 'TBD'}
                </div>

                <div
                    style={{
                        fontSize: 11,
                        color: '#666',
                        marginTop: 3,
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {name || 'To be decided'}
                </div>
            </div>
        </div>
    )
}

function Crest({
    src,
    alt,
    size,
}: {
    src?: string
    alt: string
    size: number
}) {
    if (!src) {
        return <span style={{ fontSize: size * 0.42 }}>TBD</span>
    }

    if (src.startsWith('http')) {
        return (
            <img
                src={src}
                alt={alt}
                style={{
                    width: size,
                    height: size,
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        )
    }

    return <span style={{ fontSize: size * 0.8 }}>{src}</span>
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

    const sidePosition: CSSProperties =
        side === 'left' ? { left: -42 } : { right: -42 }

    if (isImage) {
        return (
            <img
                src={flag}
                alt=""
                title={label}
                style={{
                    position: 'absolute',
                    top: '50%',
                    width: 260,
                    height: 180,
                    objectFit: 'cover',
                    opacity: 0.14,
                    transform:
                        side === 'left'
                            ? 'translateY(-50%) rotate(-8deg)'
                            : 'translateY(-50%) rotate(8deg)',
                    filter: 'saturate(1.25) contrast(1.08)',
                    ...sidePosition,
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
                fontSize: 150,
                opacity: 0.11,
                lineHeight: 1,
                transform:
                    side === 'left'
                        ? 'translateY(-50%) rotate(-8deg)'
                        : 'translateY(-50%) rotate(8deg)',
                filter: 'saturate(1.25)',
                ...sidePosition,
            }}
        >
            {flag}
        </span>
    )
}

function ChannelPill({
    name,
    region,
}: {
    name: string
    region: Region
}) {
    const color = getChannelColor(region, name)
    const regionData = REGIONS[region]
    const channel = regionData.channels.find((item) => item.name === name)

    return (
        <div
            style={{
                padding: '8px 14px',
                borderRadius: 9,
                background: `${color}12`,
                border: `1px solid ${color}35`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color,
                    fontFamily: 'var(--font-barlow)',
                }}
            >
                {name}
            </span>

            {channel && channel.type !== 'premium' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#666' }}>
                    {channel.type === 'free'
                        ? <><Tv size={10} /> Free to air</>
                        : <><Wifi size={10} /> Streaming</>}
                </span>
            )}
        </div>
    )
}

function Card({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <section
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            }}
        >
            <h2
                style={{
                    margin: '0 0 12px',
                    fontSize: 14,
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-barlow)',
                }}
            >
                {title}
            </h2>

            {children}
        </section>
    )
}

function InfoCard({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div
            style={{
                background: 'rgba(15,15,15,0.82)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 14px',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontSize: 16,
                    color: 'var(--text)',
                    fontWeight: 900,
                    fontFamily: 'var(--font-barlow)',
                }}
            >
                {value}
            </div>
        </div>
    )
}

function InfoRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
            }}
        >
            <span style={{ color: '#777', fontSize: 13 }}>{label}</span>
            <strong
                style={{
                    color: 'var(--text)',
                    fontSize: 13,
                    textAlign: 'right',
                }}
            >
                {value}
            </strong>
        </div>
    )
}