import { getAllTimes, type Region } from '@/lib/utils'

export default function TimeTooltip({ utcDate, region }: {
    utcDate: string
    region: Region
}) {
    const t = getAllTimes(utcDate, region)
    const rows = [
        { label: '🇺🇸 USA (East)', time: t.us, highlight: false },
        { label: '🇩🇿 Algeria', time: t.dz, highlight: region === 'dz' },
        { label: '🇳🇴 Norway', time: t.no, highlight: region === 'no' },
    ]
    return (
        <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 14px',
            minWidth: 200,
        }}>
            <p style={{
                fontSize: 10, color: '#666',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 8,
            }}>
                Kickoff times
            </p>
            {rows.map(row => (
                <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '5px 0',
                    gap: 16, borderBottom: '1px solid var(--border)',
                }}>
                    <span style={{ fontSize: 12, color: row.highlight ? 'var(--accent)' : '#888' }}>
                        {row.label}
                    </span>
                    <span style={{
                        fontSize: 13, fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: row.highlight ? 'var(--accent)' : 'var(--text)',
                    }}>
                        {row.time}
                        {row.highlight && t.nextDay && (
                            <span style={{ fontSize: 9, color: 'var(--red)', marginLeft: 4 }}>+1</span>
                        )}
                    </span>
                </div>
            ))}
            <p style={{ fontSize: 10, color: '#444', marginTop: 8, textAlign: 'center' }}>
                tap to close
            </p>
        </div>
    )
}