'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, History, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Today',    href: '/',         icon: Home,      match: (p: string) => p === '/' },
  { label: 'History',  href: '/history',  icon: History,   match: (p: string) => p.startsWith('/history') },
  { label: 'Progress', href: '/progress', icon: BarChart3, match: (p: string) => p.startsWith('/progress') },
  { label: 'Settings', href: '/settings', icon: Settings,  match: (p: string) => p.startsWith('/settings') },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <nav
        className="w-full max-w-md bg-[var(--surface)] rounded-t-2xl pointer-events-auto"
        style={{
          borderTop: '0.5px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-stretch">
          {tabs.map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] pt-3 pb-2',
                  active ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
