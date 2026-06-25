import { NextResponse } from 'next/server'

const API_KEY = process.env.FOOTBALL_API_KEY ?? ''
const BASE = 'https://api.football-data.org/v4'

export async function GET() {
    try {
        const res = await fetch(`${BASE}/competitions/WC/standings`, {
            headers: { 'X-Auth-Token': API_KEY },
            next: { revalidate: 60 }, // cache 60s
        })

        if (!res.ok) throw new Error(`API error ${res.status}`)
        const data = await res.json()
        return NextResponse.json({ standings: data.standings, source: 'api' })
    } catch (e) {
        return NextResponse.json({ standings: [], source: 'error' })
    }
}