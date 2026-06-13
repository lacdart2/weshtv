import { useState, useEffect } from 'react'

const STORAGE_KEY = 'weshtv-my-teams'

export function getMyTeams(): string[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export function saveMyTeams(teams: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
}

export function useMyTeams() {
    const [myTeams, setMyTeams] = useState<string[]>([])

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        setMyTeams(getMyTeams())
    }, [])

    function toggleTeam(code: string) {
        setMyTeams(prev => {
            const upper = code.toUpperCase()
            const next = prev.includes(upper)
                ? prev.filter(t => t !== upper)
                : [...prev, upper]
            saveMyTeams(next)
            return next
        })
    }

    function isFollowing(code: string): boolean {
        return myTeams.includes(code.toUpperCase())
    }

    return { myTeams, toggleTeam, isFollowing }
}