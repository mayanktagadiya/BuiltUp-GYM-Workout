'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink, Play } from 'lucide-react'
import { extractYouTubeId } from '@/lib/utils/youtube'

interface VideoModalProps {
  open: boolean
  onClose: () => void
  exerciseName: string
  muscleGroup: string
  secondaryMuscles?: string | null
  videoUrl: string | null
  formCues?: string | null
}

export function VideoModal({
  open,
  onClose,
  exerciseName,
  muscleGroup,
  secondaryMuscles,
  videoUrl,
  formCues,
}: VideoModalProps) {
  const [playing, setPlaying] = useState(false)

  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null
  const isPlaceholder = !videoUrl || videoUrl.includes('PLACEHOLDER') || !videoId

  useEffect(() => {
    if (!open) setPlaying(false)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto rounded-t-2xl flex flex-col overflow-hidden"
            style={{
              background: 'var(--bg)',
              borderTop: '0.5px solid var(--border)',
              height: '70vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Top bar */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0">
              <div className="min-w-0 flex-1 pr-4">
                <p
                  className="font-medium"
                  style={{ fontSize: 14, color: 'var(--text-primary)' }}
                >
                  {exerciseName}
                </p>
                <p className="mt-0.5" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {muscleGroup}
                  {secondaryMuscles ? ` · ${secondaryMuscles}` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
                aria-label="Close"
              >
                <X size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>

            {/* Video */}
            <div className="px-5 flex-shrink-0">
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
                    title={exerciseName}
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 w-full h-full block"
                    aria-label="Play video"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                      alt={exerciseName}
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
            </div>

            {/* Scrollable lower section */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 flex flex-col gap-4">
              {formCues && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {formCues}
                </p>
              )}

              {!isPlaceholder && videoUrl && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 self-start"
                  style={{ color: 'var(--text-secondary)', fontSize: 12 }}
                >
                  <ExternalLink size={12} />
                  View on YouTube
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
