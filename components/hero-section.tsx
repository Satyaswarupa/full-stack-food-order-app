'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ArrowRight, Clock, Truck, Star } from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjI4M0YiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Star className="h-4 w-4 fill-current" />
            Fresh & Delicious
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Order Your Favorite Food{' '}
            <span className="text-primary">Delivered Fast</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Browse our delicious menu, add items to your cart, and get your order delivered right to your doorstep with real-time tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {!user ? (
              <>
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#menu">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base px-8">
                    <ShoppingBag className="h-4 w-4" />
                    Browse Menu
                  </Button>
                </a>
              </>
            ) : (
              <a href="#menu">
                <Button size="lg" className="gap-2 text-base px-8">
                  <ShoppingBag className="h-4 w-4" />
                  Start Ordering
                </Button>
              </a>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-foreground">Quick Delivery</span>
              <span className="text-sm text-muted-foreground">30-45 minutes</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <span className="font-medium text-foreground">Live Tracking</span>
              <span className="text-sm text-muted-foreground">Real-time updates</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-foreground">Best Quality</span>
              <span className="text-sm text-muted-foreground">Fresh ingredients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
