import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Zap,
  FileText,
  MessageSquare,
  Globe,
  Shield,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
} from 'lucide-react'

function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])

  return count
}

const FEATURES = [
  {
    icon: FileText,
    color: '#3B82F6',
    title: 'Resume Analyser',
    desc: 'Get ATS scores, keyword gaps, and actionable tips to beat automated screening systems.',
  },
  {
    icon: MessageSquare,
    color: '#06B6D4',
    title: 'Interview Practice',
    desc: 'Practice with role-specific questions, get STAR method scoring, and ideal model answers.',
  },
  {
    icon: Globe,
    color: '#10B981',
    title: 'Portfolio Reviewer',
    desc: 'Audit your GitHub profile, rewrite project impact statements, and identify missing work.',
  },
  {
    icon: Shield,
    color: '#F59E0B',
    title: 'Scam Detector',
    desc: 'Instantly identify fake job postings before you apply or share personal information.',
  },
]

const STEPS = [
  { step: '01', title: 'Paste your content', desc: 'Resume, job post, GitHub URL, or interview question — just paste and go.' },
  { step: '02', title: 'Claude AI analyses', desc: 'Our AI engine processes your input against real-world placement standards.' },
  { step: '03', title: 'Get actionable results', desc: 'Detailed scores, specific gaps, and concrete next steps — not generic advice.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const studentsCount = useCountUp(500, 1500, statsVisible)
  const toolsCount = useCountUp(4, 800, statsVisible)
  const questionsCount = useCountUp(30, 1200, statsVisible)
  const freeCount = useCountUp(100, 1000, statsVisible)

  // Scroll indicator
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Stats counter intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll animations for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('section-visible')
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F8FAFC] overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#3B82F6] opacity-[0.06] blur-[80px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#06B6D4] opacity-[0.06] blur-[80px]" />
        <div className="bg-grid absolute inset-0 opacity-100" />
      </div>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-[#1E3A5F]/50"
        style={{ background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-base font-bold font-grotesk text-[#F8FAFC]">CareerAI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">How it works</a>
        </div>

        <button
          onClick={() => navigate('/app/resume')}
          className="btn-primary text-sm py-2 px-5"
        >
          Try Free Now →
        </button>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-8">
          <Sparkles size={14} className="text-[#06B6D4]" />
          <span className="text-xs font-mono text-[#06B6D4] uppercase tracking-widest">
            Powered by Groq AI
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold font-grotesk mb-6 leading-tight">
          Land Your Dream Job
          <br />
          <span className="text-gradient">Before Graduation</span>
        </h1>

        <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered career tools built for Indian college students. Resume analysis,
          mock interviews, portfolio audits, and scam detection — all in one suite.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/app/resume')}
            className="btn-primary text-base py-3.5 px-8 flex items-center gap-2"
          >
            Start for Free
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/app/scam')}
            className="btn-secondary text-sm py-3.5 px-8"
          >
            Try Scam Detector →
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
            ))}
            <span className="text-xs text-[#94A3B8] ml-1">Trusted by students</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#94A3B8]">No signup required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#94A3B8]">100% free to use</span>
          </div>
        </div>

        {/* Scroll indicator */}
        {scrollY === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={24} className="text-[#475569]" />
          </div>
        )}
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-12 px-8 border-y border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: studentsCount, suffix: '+', label: 'Students Helped' },
            { value: toolsCount, suffix: '', label: 'AI Tools' },
            { value: questionsCount, suffix: '+', label: 'Question Types' },
            { value: freeCount, suffix: '%', label: 'Free Forever' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold font-grotesk text-gradient">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-[#475569] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-8 max-w-6xl mx-auto">
        <div
          className="text-center mb-16 animate-on-scroll"
          style={{ opacity: 0, transform: 'translateY(24px)', transition: '600ms ease' }}
        >
          <div className="label-tag text-[#06B6D4] mb-3 block">Features</div>
          <h2 className="text-3xl md:text-4xl font-bold font-grotesk mb-4">
            Everything you need for{' '}
            <span className="text-gradient">campus placements</span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto">
            Four specialized AI tools that cover every stage of your job search — from resume to offer letter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="card p-6 cursor-pointer animate-on-scroll"
                style={{
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: `600ms ease ${i * 100}ms`,
                }}
                onClick={() => navigate(`/app/${['resume', 'interview', 'portfolio', 'scam'][i]}`)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold font-grotesk text-[#F8FAFC] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-mono" style={{ color: feature.color }}>
                  Try it free <ArrowRight size={12} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-8 bg-[#0D1B2A]/50">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center mb-16 animate-on-scroll"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: '600ms ease' }}
          >
            <div className="label-tag text-[#06B6D4] mb-3 block">How it works</div>
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk">
              Three steps to career-ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center animate-on-scroll"
                style={{
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: `600ms ease ${i * 150}ms`,
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-white font-mono">{step.step}</span>
                </div>
                <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center max-w-3xl mx-auto">
        <div
          className="animate-on-scroll"
          style={{ opacity: 0, transform: 'translateY(24px)', transition: '600ms ease' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-grotesk mb-4">
            Ready to land your <span className="text-gradient">dream job?</span>
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Join thousands of Indian college students using CareerAI to ace their placements.
          </p>
          <button
            onClick={() => navigate('/app/resume')}
            className="btn-primary text-base py-4 px-10 flex items-center gap-2 mx-auto"
          >
            Start for Free
            <ArrowRight size={18} />
          </button>
          <p className="text-xs text-[#475569] mt-4">No account needed. Just paste and analyse.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F]/40 py-8 px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-sm font-bold font-grotesk text-[#F8FAFC]">CareerAI</span>
        </div>
        <p className="text-xs text-[#475569]">
          AI-powered career readiness suite for Indian college students.
          Powered by Groq AI.
        </p>
      </footer>
    </div>
  )
}
