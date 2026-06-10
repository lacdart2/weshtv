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
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 420,
            background: '#111',
            border: '1px solid rgba(46,204,113,0.4)',
            borderRadius: 16,
            padding: '16px 20px',
            zIndex: 999,
            boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        }}>
            {/* Top row — icon + text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                    width: 48, height: 48, flexShrink: 0,
                    background: '#090909',
                    border: '1px solid #222',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 900,
                    color: 'var(--accent)',
                    fontFamily: 'system-ui',
                }}>
                    W
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                        Add WESHTV to your phone
                    </div>
                    <div style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>
                        Matches & channels · always one tap away
                    </div>
                </div>
            </div>

            {/* Bottom row — buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        flex: 1, padding: '10px',
                        borderRadius: 10,
                        border: '1px solid #333',
                        background: 'transparent',
                        color: '#999', fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-inter)',
                    }}
                >
                    Later
                </button>
                <button
                    onClick={install}
                    style={{
                        flex: 2, padding: '10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'var(--accent)',
                        color: '#000', fontSize: 13,
                        fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-inter)',
                        letterSpacing: '0.04em',
                    }}
                >
                    Install
                </button>
            </div>
        </div>
    )
}