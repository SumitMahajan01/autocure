import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { supabase } from '../hooks/useAuth.tsx'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@autocure.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 2040-CURE' },
  { icon: MapPin, label: 'HQ', value: 'Neo Tokyo, Japan' },
]

export function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      })

      if (error) throw error

      alert("Message sent! We'll get back to you soon.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Get In </span>
            <span className="text-primary neon-text">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have questions about our products or need support? We're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left column - Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-card p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {info.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">{info.value}</p>
                  </div>
                </motion.div>
              )
            })}

            {/* Business hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-5"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Business Hours
              </p>
              <p className="text-sm text-foreground">Mon - Fri: 9:00 AM - 6:00 PM</p>
              <p className="text-sm text-foreground">Sat: 10:00 AM - 4:00 PM</p>
              <p className="text-sm text-muted-foreground">Sun: Closed</p>
            </motion.div>
          </motion.div>

          {/* Right column - Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <input
                type="text"
                placeholder="Subject"
                maxLength={200}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />

              <textarea
                placeholder="Message *"
                required
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full min-h-[150px] resize-none px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-display font-bold tracking-wider rounded-lg neon-glow hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Send size={18} />
                {loading ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
