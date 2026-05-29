const PATTERNS = [
  /[?&]v=([^&#]+)/,
  /youtu\.be\/([^?&#/]+)/,
  /\/embed\/([^?&#/]+)/,
  /\/shorts\/([^?&#/]+)/,
]

export function extractYouTubeId(url: string): string | null {
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}
