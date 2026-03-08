import { motion } from 'framer-motion'
import { Shield, Zap, Award, Users } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'

const values = [
  {
    icon: Shield,
    title: 'Quality First',
    desc: 'Every product is rigorously tested and formulated with premium-grade ingredients.',
  },
  {
    icon: Zap,
    title: 'Nano-Technology',
    desc: 'We harness cutting-edge nano-ceramic science to deliver unmatched protection.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    desc: 'Recognized by industry leaders for innovation and performance excellence.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    desc: 'Built by detailing enthusiasts, for detailing enthusiasts worldwide.',
  },
]

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '200+', label: 'Products' },
  { value: '35+', label: 'Countries' },
  { value: '4.9★', label: 'Avg Rating' },
]

export function AboutPage() {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">About </span>
            <span className="text-primary neon-text">AutoCure</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Founded in 2035, AutoCure emerged from a simple vision: to revolutionize car care
            through the power of nano-technology. What started as a small garage operation
            has grown into a global leader in automotive protection, serving enthusiasts
            and professionals alike with products that push the boundaries of what's possible.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <p className="font-display text-3xl font-bold text-primary neon-text">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            <span className="text-foreground">Our </span>
            <span className="text-secondary neon-text-purple">Values</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center group hover:border-primary/40 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:neon-glow transition-all duration-500">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <h3 className="font-display text-sm font-bold mb-2 tracking-wider uppercase">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl font-bold mb-6">
            <span className="text-foreground">Our </span>
            <span className="text-primary neon-text">Story</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The journey began when our founder, frustrated with existing car care products that
            promised much but delivered little, set out to create something truly revolutionary.
            After years of research and development in nano-ceramic technology, the first AutoCure
            coating was born — a product that would change how the world thinks about vehicle protection.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, we're proud to serve a global community of car enthusiasts who share our passion
            for perfection. From daily drivers to show cars, our products protect what matters most
            to you. And we're just getting started — the future of automotive care is being written
            right here, right now.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
