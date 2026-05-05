'use client'

import { cn } from '@/lib/utils'

interface LoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loader({ className, size = 'md', text }: LoaderProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizes[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  )
}

export function OverlayLoader({ text = 'Processing...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg">
        <Loader size="lg" />
        <p className="text-lg font-medium text-foreground">{text}</p>
      </div>
    </div>
  )
}
