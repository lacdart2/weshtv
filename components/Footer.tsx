import { Tv, Coffee } from 'lucide-react'

export default function Footer() {
    return (
        <div style={{
            padding: '32px 20px',
            borderTop: '1px solid var(--border)',
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
        }}>
            <span style={{
                fontFamily: 'var(--font-barlow)',
                fontSize: 16, fontWeight: 900,
                letterSpacing: '0.08em', color: 'var(--text)',
            }}>
                WESH<span style={{ color: 'var(--accent)' }}>TV</span>
            </span>
            <p style={{
                fontSize: 13, color: '#666',
                fontFamily: 'var(--font-inter)',
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <Tv size={13} color="#666" style={{ flexShrink: 0 }} />
                Every match. Right channel. Right time.
            </p>
            <p style={{
                fontSize: 12, color: '#777',
                fontFamily: 'var(--font-inter)',
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <Coffee size={13} color="#777" />
                Made by <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 3 }}>Kader</span>
                <span style={{ color: '#333', margin: '0 4px' }}>·</span>
                World Cup 2026
            </p>
        </div>
    )
}