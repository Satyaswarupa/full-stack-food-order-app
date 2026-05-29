'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  Truck,
  MapPin,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative w-full overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/12 via-background to-background" />
      <div className="absolute top-8 right-[10%] h-40 w-40 rounded-full bg-primary/25 blur-3xl animate-hero-glow" />
      <div className="absolute bottom-0 left-[5%] h-32 w-32 rounded-full bg-accent/20 blur-3xl animate-hero-glow hero-delay-2" />

      <div className="app-shell relative py-10 md:py-14">
        {/* Floating decorative icons */}
        <div
          className="pointer-events-none absolute right-2 top-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 animate-hero-float"
          aria-hidden
        >
          <UtensilsCrossed className="h-7 w-7 text-primary/70" />
        </div>
        <div
          className="pointer-events-none absolute right-16 top-20 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 animate-hero-float-delayed"
          aria-hidden
        >
          <Truck className="h-5 w-5 text-accent/80" />
        </div>
        <div
          className="pointer-events-none absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 animate-hero-float-delayed hero-delay-1"
          aria-hidden
        >
          <Sparkles className="h-5 w-5 text-primary/60" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <span className="label-chip bg-primary/15 text-primary mb-4 animate-hero-fade-up inline-flex">
            <MapPin className="h-3 w-3" />
            Delivering near you
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-[1.15] text-balance animate-hero-fade-up hero-delay-1">
            Order food{' '}
            <span className="hero-text-shimmer">delivered fast</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground mt-3 text-pretty animate-hero-fade-up hero-delay-2">
            Browse the menu, track your rider live, and pay a fair fee based on distance.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6 animate-hero-fade-up hero-delay-3">
            {!user ? (
              <>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/25 h-12"
                  >
                    Get Started
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
                    Browse Menu
                  </Button>
                </a>
              </>
            ) : (
              <a href="#menu" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl gap-2 shadow-lg shadow-primary/25 h-12"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Start Ordering
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-8 w-full animate-hero-fade-up hero-delay-4">
            {[
              { icon: Clock, label: 'Quick', sub: '30–45 min' },
              { icon: Truck, label: 'Live', sub: 'GPS track' },
              { icon: MapPin, label: 'Fair', sub: 'Km pricing' },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-1 rounded-xl glass-panel p-3 text-center min-h-[88px] transition-transform hover:scale-[1.02]"
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground leading-none">{label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
