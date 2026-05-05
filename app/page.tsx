import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ItemsGrid } from '@/components/items-grid'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main className="container mx-auto px-4 py-8" id="menu">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Our Menu</h2>
          <p className="text-muted-foreground">
            Discover our delicious selection of items
          </p>
        </div>
        <ItemsGrid />
      </main>
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>OrderFlow - Food Ordering Made Simple</p>
        </div>
      </footer>
    </div>
  )
}
