import { useLocation } from 'react-router-dom'
import { Sparkles, Bell } from 'lucide-react'

const PAGE_META = {
  '/app/resume': {
    title: 'Resume Analyser',
    desc: 'ATS scoring & job match analysis',
  },
  '/app/interview': {
    title: 'Interview Practice',
    desc: 'AI-powered mock interview sessions',
  },
  '/app/portfolio': {
    title: 'Portfolio Reviewer',
    desc: 'GitHub audit & impact rewriting',
  },
  '/app/scam': {
    title: 'Scam Detector',
    desc: 'Fake job posting analysis',
  },
}

export default function Topbar() {
  const location = useLocation()
  const meta = PAGE_META[location.pathname] || { title: 'CareerAI', desc: '' }

  return (
    <div
      className="h-16 border-b border-[#1E3A5F]/50 flex items-center justify-between px-8 shrink-0"
      style={{
        background: 'rgba(13, 27, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div>
        <h1 className="text-base font-semibold text-[#F8FAFC] font-grotesk">
          {meta.title}
        </h1>
        <p className="text-xs text-[#475569]">{meta.desc}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20">
          <Sparkles size={12} className="text-[#06B6D4]" />
          <span className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider">
            AI Powered
          </span>
        </div>

        {/* Notification bell */}
        <button className="w-8 h-8 rounded-lg bg-[#1E3A5F]/40 flex items-center justify-center hover:bg-[#1E3A5F] transition-colors">
          <Bell size={15} className="text-[#94A3B8]" />
        </button>
      </div>
    </div>
  )
}
