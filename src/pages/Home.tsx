import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { HeroSection } from '../components/HeroSection'
import { ProductShowcase } from '../components/ProductShowcase'

export function Home() {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />
      <HeroSection />
      <ProductShowcase />
      <Footer />
    </div>
  )
}
