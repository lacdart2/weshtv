import Image from 'next/image'

export default function Crest({ src, alt, size = 20 }: {
    src: string
    alt: string
    size?: number
}) {
    if (src?.startsWith('http')) {
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