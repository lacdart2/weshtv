export default function LiveDot() {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--red)', display: 'inline-block',
                animation: 'livepulse 1.2s infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.1em' }}>
                LIVE
            </span>
        </span>
    )
}