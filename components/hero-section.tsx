'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ArrowRight, Clock, Truck, MapPin, Star } from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative w-full overflow-hidden border-b border-border/40">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/18 via-background/60 to-background" />
      <div className="absolute inset-0 hero-radial-glow" />

      {/* Ambient glow orbs */}
      <div className="absolute -top-12 right-[12%] h-64 w-64 rounded-full bg-primary/22 blur-[80px] animate-hero-glow" />
      <div className="absolute top-[45%] left-[-5%] h-44 w-44 rounded-full bg-orange-500/18 blur-[60px] animate-hero-glow hero-delay-2" />
      <div className="absolute bottom-0 right-[5%] h-36 w-36 rounded-full bg-yellow-400/10 blur-[50px] animate-hero-glow hero-delay-1" />

      {/* Floating food emoji cards */}
      <div
        className="pointer-events-none select-none absolute right-2 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card/70 border border-border/50 backdrop-blur-md text-2xl shadow-xl animate-hero-float"
        aria-hidden
      >
        🍕
      </div>
      <div
        className="pointer-events-none select-none absolute right-[4.5rem] top-[5.5rem] flex h-11 w-11 items-center justify-center rounded-xl bg-card/60 border border-border/40 backdrop-blur-md text-xl shadow-lg animate-hero-float-delayed hero-delay-1"
        aria-hidden
      >
        🍔
      </div>
      <div
        className="pointer-events-none select-none absolute left-0 top-8 flex h-11 w-11 items-center justify-center rounded-xl bg-card/60 border border-border/40 backdrop-blur-md text-xl shadow-lg animate-hero-float hero-delay-2"
        aria-hidden
      >
        🍜
      </div>
      <div
        className="pointer-events-none select-none absolute right-4 bottom-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-card/70 border border-border/40 backdrop-blur-md text-xl shadow-xl animate-hero-float-delayed"
        aria-hidden
      >
        🍗
      </div>

      <div className="app-shell relative py-12 md:py-16">
        {/* Live badge */}
        <div className="mb-5 flex items-center gap-2 animate-hero-fade-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400">
            Now Accepting Orders
          </span>
        </div>

        {/* Brand name row */}
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/80 mb-3 flex items-center gap-2 animate-hero-fade-up hero-delay-1">
          <span className="inline-block h-px w-5 bg-primary/50" />
          Youtube Food Corner
          <span className="inline-block h-px w-5 bg-primary/50" />
        </p>

        {/* Headline */}
        <h1 className="text-[2.5rem] md:text-5xl font-extrabold text-foreground leading-[1.08] tracking-tight text-balance animate-hero-fade-up hero-delay-1 mb-2">
          Craving something{' '}
          <span className="hero-text-shimmer">amazing?</span>
        </h1>
        <p className="text-lg md:text-xl font-semibold text-muted-foreground animate-hero-fade-up hero-delay-2 mb-3">
          We&apos;ve got you covered.
        </p>

        <p className="text-sm text-muted-foreground text-pretty max-w-[300px] animate-hero-fade-up hero-delay-2 leading-relaxed">
          Hot food from your favourite restaurant — tracked live, every step from kitchen to your door.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-hero-fade-up hero-delay-3">
          {!user ? (
            <>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/30 h-12 font-bold text-base"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#menu" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto rounded-xl gap-2 h-12"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View Menu
                </Button>
              </a>
            </>
          ) : (
            <a href="#menu" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/30 h-12 font-bold text-base"
              >
                <ShoppingBag className="h-4 w-4" />
                Start Ordering
              </Button>
            </a>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-6 flex items-center gap-3 animate-hero-fade-up hero-delay-4">
          <div className="flex -space-x-2.5">
            {['🧑‍🍳', '👩', '👨', '🧕'].map((emoji, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[13px]"
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-1.5 text-xs text-muted-foreground font-medium">Loved by customers</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-14 h-px bg-border/60 my-7 animate-hero-fade-up hero-delay-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full animate-hero-fade-up hero-delay-4">
          {[
            { icon: Clock, label: 'Fast', sub: '30–45 min' },
            { icon: Truck, label: 'Live GPS', sub: 'Real-time' },
            { icon: MapPin, label: 'Fair Price', sub: 'Km-based fee' },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl glass-panel p-3 text-center min-h-[90px] transition-all hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-foreground leading-none">{label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
