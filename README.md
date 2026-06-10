# WESHTV 📺⚽

> Wesh, c'est sur quelle chaîne et à quelle heure?

World Cup 2026 TV guide built for Algerian, Tunisian, Moroccan and Norwegian football fans.

## What it does

- Shows all 104 World Cup 2026 matches
- Displays the correct TV channel per region (Algeria / Norway)
- Converts kickoff times to your local timezone — tap any match time for a full breakdown
- Highlights Algeria national team matches with free-to-air channel (Algérie 1)

## Regions supported

| Region                         | Channels                                            |
| ------------------------------ | --------------------------------------------------- |
| 🇩🇿 Algeria / Tunisia / Morocco | beIN Sports MAX 1–3, Algérie 1 (free), beIN CONNECT |
| 🇳🇴 Norway                      | NRK1 (free), NRK2, TV 2, TV 2 Play                  |

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- football-data.org API
- CSS variables — no UI framework

## Getting started

```bash
npm install
```

Add your API key to `.env.local`:

```
FOOTBALL_API_KEY=your_key_from_football-data.org
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data sources

- Match schedule: [football-data.org](https://football-data.org) free tier
- TV channels: manually curated from official broadcaster announcements (beIN Sports, EPTV, NRK, TV 2)

## License

MIT
