'use client'

import { Share2 } from 'lucide-react'

const APP_URL = 'https://weshtv.vercel.app'

export default function ShareAppButton() {
    async function handleShare() {
        const shareText =
            'WESHTV ⚽\nCheck World Cup matches, kickoff times, and TV channels for Norway, Algeria, Tunisia and Morocco.\n\n' +
            APP_URL

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'WESHTV',
                    text: 'World Cup match times and channels',
                    url: APP_URL,
                })
                return
            } catch {
                // User cancelled share sheet — no problem
                return
            }
        }

        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            '_blank'
        )
    }

    return (
        <button
            onClick={handleShare}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 10,
                border: '1px solid rgba(46,204,113,0.28)',
                background: 'rgba(46,204,113,0.08)',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 800,
                fontFamily: 'var(--font-inter)',
                cursor: 'pointer',
                textDecoration: 'none',
            }}
        >
            <Share2 size={14} />
            Share app
        </button>
    )
}