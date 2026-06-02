import { UserLayout } from '@/components/user-layout'
import { HeroSection } from '@/components/hero-section'
import { ItemsGrid } from '@/components/items-grid'

export default function HomePage() {
  return (
    <UserLayout>
      <HeroSection />
      <main className="mobile-container py-6 md:py-8" id="menu">
        <div className="mb-5">
          <span className="label-chip bg-secondary text-muted-foreground mb-2">Menu</span>
          <h2 className="text-2xl font-bold text-foreground">Order now</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap + to add items to your cart
          </p>
        </div>
        <ItemsGrid />
      </main>
      <footer className="border-t border-border/40 py-6 mt-4 mb-2">
        <div className="mobile-container text-center text-muted-foreground text-xs">
          <p>Youtube Food Corner · Food ordering made simple</p>
        </div>
      </footer>
    </UserLayout>
  )
}
