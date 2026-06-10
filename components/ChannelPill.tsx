import { getChannelColor, type Region } from '@/lib/channels'

export default function ChannelPill({ name, region }: {
    name: string
    region: Region
}) {
    const color = getChannelColor(region, name)
    return (
        <span style={{
            padding: '2px 7px', borderRadius: 4,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
            background: `${color}18`, color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap',
        }}>
            {name}
        </span>
    )
}