'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { extractYouTubeId } from '@/lib/utils/youtube'

interface Props {
  videoUrl: string | null
  title: string
}

export function LiteYoutubeEmbed({ videoUrl, title }: Props) {
  const [playing, setPlaying] = useState(false)

  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null
  const isPlaceholder = !videoUrl || videoUrl.includes('PLACEHOLDER') || !videoId

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-black w-full"
      style={{ aspectRatio: '16/9' }}
    >
      {isPlaceholder ? (
        <div className="w-full h-full flex items-center justify-center">
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Video coming soon</p>
        </div>
      ) : playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          title={title}
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full block"
          aria-label={`Play ${title}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <Play size={18} fill="black" style={{ color: 'black' }} />
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
