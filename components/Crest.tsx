import Image from 'next/image'

export default function Crest({ src, alt, size = 20 }: {
    src: string | undefined
    alt: string
    size?: number
}) {
    if (src?.startsWith('http')) {
        if (!src) return <span style={{ fontSize: size * 0.5, color: '#444' }}>?</span>
        return (
            <Image
                src={src}
                alt={alt}
                width={size}
                height={size}
                style={{ objectFit: 'contain' }}
            />
        )
    }
    return <span style={{ fontSize: size * 0.8 }}>{src}</span>
}