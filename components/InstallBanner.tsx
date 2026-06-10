'use client'

import { useState, useEffect } from 'react'

export default function InstallBanner() {
    const [prompt, setPrompt] = useState<any>(null)
    const [visible, setVisible] = useState(false)
    const [installed, setInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInstalled(true)
            return
        }

        const handler = (e: any) => {
            e.preventDefault()
            setPrompt(e)
            setVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    async function install() {
        if (!prompt) return
        prompt.prompt()
        const result = await prompt.userChoice
        if (result.outcome === 'accepted') {
            setVisible(false)
            setInstalled(true)
        }
    }

    if (!visible || installed) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 480,
            background: '#111',
            border: '1px solid rgba(46,204,113,0.3)',
            borderRadius: 14,
            padding: '16px 20px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Icon */}
                <div style={{
                    width: 44, height: 44,
                    background: '#090909',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 900,
                    color: 'var(--accent)',
                    flexShrink: 0,
                    fontFamily: 'system-ui',
                }}>
                    W
                </div>
                <div>
                    <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: 'var(--text)', marginBottom: 2,
                    }}>
                        Add WESHTV to your phone
                    </div>
                    <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>
                        Matches & channels · always one tap away
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid #333',
                        background: 'transparent',
                        color: '#999',
                        fontSize: 12,
                        cursor: 'pointer',
                    }}
                >
                    Later
                </button>
                <button
                    onClick={install}
                    style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--accent)',
                        color: '#000',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.04em',
                    }}
                >
                    Install
                </button>
            </div>
        </div>
    )
}