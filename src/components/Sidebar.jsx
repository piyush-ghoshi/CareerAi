import { useLocation, NavLink } from 'react-router-dom'
import {
  FileText,
  MessageSquare,
  Globe,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    label: 'Resume Analyser',
    href: '/app/resume',
    icon: FileText,
    desc: 'ATS & match scoring',
  },
  {
    label: 'Interview Practice',
    href: '/app/interview',
    icon: MessageSquare,
    desc: 'AI mock interviews',
  },
  {
    label: 'Portfolio Reviewer',
    href: '/app/portfolio',
    icon: Globe,
    desc: 'GitHub audit',
  },
  {
    label: 'Scam Detector',
    href: '/app/scam',
    icon: Shield,
    desc: 'Fake job checker',
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 h-screen bg-[#0D1B2A] border-r border-[#1E3A5F] flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#1E3A5F]">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F8FAFC] font-grotesk">CareerAI</div>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
        <div className="text-xs font-mono uppercase tracking-widest text-[#475569] px-3 mb-2">
          Tools
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.href

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6]/20 to-[#06B6D4]/10 border border-[#3B82F6]/30 text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:bg-[#1E3A5F]/40 hover:text-[#F8FAFC]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]'
                    : 'bg-[#1E3A5F]/60 group-hover:bg-[#1E3A5F]'
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isActive ? 'text-[#F8FAFC]' : ''}`}>
                  {item.label}
                </div>
                <div className="text-xs text-[#475569] truncate">{item.desc}</div>
              </div>
              {isActive && <ChevronRight size={14} className="text-[#3B82F6] shrink-0" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1E3A5F]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div>
            <div className="text-xs font-medium text-[#F8FAFC]">Student</div>
            <div className="text-xs text-[#475569]">Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
