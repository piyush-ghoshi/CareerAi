import { useState, useRef, useEffect } from 'react'
import {
  Globe, ChevronRight, AlertCircle, RefreshCw, Loader2,
  CheckCircle, XCircle, ArrowRight, Code2, FileText, Zap, Clock, Trash2, X,
} from 'lucide-react'
import { reviewPortfolio } from '../api/claude'
import { useClaude } from '../hooks/useClaude'
import { useToast } from '../hooks/useToast'
import { useHistory, formatTimestamp } from '../hooks/useHistory'
import ScoreRing from '../components/ScoreRing'
import Toast from '../components/Toast'
import EmptyState from '../components/EmptyState'
import { TARGET_ROLES } from '../utils/constants'

const LOADING_MESSAGES = ['Auditing your GitHub portfolio...', 'Analysing project impact...', 'Checking README quality...', 'Almost there...']

const README_CHECKS = [
  { key: 'problemStatement', label: 'Problem Statement' },
  { key: 'techStack', label: 'Tech Stack Listed' },
  { key: 'demoLink', label: 'Demo / Live Link' },
  { key: 'screenshots', label: 'Screenshots Included' },
  { key: 'setupInstructions', label: 'Setup Instructions' },
]

function getScoreColor(score, max = 10) {
  const pct = (score / max) * 100
  if (pct >= 70) return '#10B981'
  if (pct >= 40) return '#F59E0B'
  return '#EF4444'
}

export default function PortfolioReviewer() {
  const [githubUrl, setGithubUrl] = useState('')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [projectsDescription, setProjectsDescription] = useState('')
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [showHistory, setShowHistory] = useState(false)
  const [activeResult, setActiveResult] = useState(null)

  const { loading, error, result, run, reset } = useClaude()
  const { toasts, success, error: toastError } = useToast()
  const { history, addEntry, removeEntry, clearHistory } = useHistory('portfolio')
  const resultsRef = useRef(null)
  const msgIntervalRef = useRef(null)

  const displayResult = activeResult ?? result

  useEffect(() => {
    if (loading) {
      let idx = 0
      msgIntervalRef.current = setInterval(() => { idx = (idx + 1) % LOADING_MESSAGES.length; setLoadingMsg(LOADING_MESSAGES[idx]) }, 1800)
    } else { clearInterval(msgIntervalRef.current); setLoadingMsg(LOADING_MESSAGES[0]) }
    return () => clearInterval(msgIntervalRef.current)
  }, [loading])

  async function handleReview() {
    if (projectsDescription.length < 100) { toastError('Please describe your projects in more detail (at least 100 characters).'); return }
    if (!githubUrl.includes('github.com')) { toastError('Please enter a valid GitHub URL (e.g. github.com/username)'); return }
    setActiveResult(null)
    const data = await run(reviewPortfolio, githubUrl, targetRole, projectsDescription)
    if (data) {
      setHasReviewed(true)
      addEntry({ result: data, githubUrl, targetRole, projectSnippet: projectsDescription.slice(0, 80) })
      success('Portfolio audit complete!')
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    }
  }

  function loadHistoryItem(item) {
    setActiveResult(item.result); setShowHistory(false); setHasReviewed(true)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#475569] mb-3">
            <span>Tools</span><ChevronRight size={12} /><span className="text-[#06B6D4]">Portfolio Reviewer</span>
          </div>
          <h1 className="text-3xl font-bold font-grotesk text-[#F8FAFC] mb-2">Portfolio Reviewer</h1>
          <p className="text-[#94A3B8]">Get your GitHub portfolio audited for README quality, tech relevance, and impact.</p>
        </div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A5F]/40 border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors text-sm text-[#94A3B8] hover:text-[#F8FAFC]">
            <Clock size={14} />{showHistory ? 'Hide' : 'History'} ({history.length})
          </button>
        )}
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="card p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-grotesk text-[#F8FAFC] flex items-center gap-2"><Clock size={14} className="text-[#06B6D4]" />Previous Audits</h3>
            <button onClick={clearHistory} className="text-xs text-[#475569] hover:text-[#EF4444] flex items-center gap-1 transition-colors"><Trash2 size={12} />Clear all</button>
          </div>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-hide">
            {history.map(item => (
              <div key={item.id} onClick={() => loadHistoryItem(item)}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] hover:border-[#3B82F6]/40 transition-colors cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-[#475569]">{formatTimestamp(item.timestamp)}</span>
                    <span className="label-tag px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6]">{item.targetRole}</span>
                    <span className="label-tag px-1.5 py-0.5 rounded" style={{ background: `${getScoreColor(item.result.overallScore, 10)}20`, color: getScoreColor(item.result.overallScore, 10) }}>
                      {item.result.overallScore}/10
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] truncate">{item.githubUrl}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); removeEntry(item.id) }}
                  className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#EF4444]/20 transition-all">
                  <X size={12} className="text-[#475569]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="card p-6 flex flex-col gap-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#475569]">GitHub URL</label>
            <input type="text" className="input-field px-4 py-3 text-sm w-full" placeholder="github.com/yourusername"
              value={githubUrl} onChange={e => setGithubUrl(e.target.value)} disabled={loading} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#475569]">Target Role</label>
            <select className="input-field px-4 py-3 text-sm w-full" value={targetRole} onChange={e => setTargetRole(e.target.value)} disabled={loading}>
              {TARGET_ROLES.map(r => <option key={r} value={r} className="bg-[#0D1B2A]">{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-[#475569]">Describe Your Projects</label>
          <textarea className="input-field p-4 text-sm leading-relaxed resize-none w-full" style={{ minHeight: '160px' }}
            placeholder="List your key projects with tech stack and features...&#10;e.g. 1. E-commerce site — React, Node.js, MongoDB — 200+ users&#10;2. ML chatbot — Python, Flask — deployed on Heroku"
            value={projectsDescription} onChange={e => setProjectsDescription(e.target.value)} disabled={loading} />
          <div className="flex justify-end text-xs">
            <span className={projectsDescription.length >= 100 ? 'text-[#10B981]' : 'text-[#475569]'}>{projectsDescription.length} / 100 min chars</span>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2D0F0F] border border-[#EF4444]/30">
            <AlertCircle size={14} className="text-[#EF4444]" /><span className="text-xs text-[#EF4444] flex-1">{error}</span>
            <button onClick={reset}><RefreshCw size={12} className="text-[#475569]" /></button>
          </div>
        )}
        <button onClick={handleReview} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" />{loadingMsg}</> : <><Globe size={16} />Audit My Portfolio →</>}
        </button>
      </div>

      {/* Results */}
      <div ref={resultsRef}>
        {loading && <PortfolioSkeleton />}
        {!loading && !displayResult && !hasReviewed && <EmptyState icon={Globe} title="No audit yet" description="Enter your GitHub URL and project details above to start." />}
        {!loading && displayResult && <PortfolioResults result={displayResult} />}
      </div>
    </div>
  )
}

function PortfolioResults({ result }) {
  const checks = result.readmeQuality?.checks ?? {}
  const checkEntries = README_CHECKS.map(c => ({ label: c.label, passed: Boolean(checks[c.key]) }))
  const checksPassed = checkEntries.filter(c => c.passed).length

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col items-center gap-3">
          <ScoreRing score={result.overallScore ?? 0} maxScore={10} size={120} strokeWidth={10} color={getScoreColor(result.overallScore ?? 0, 10)} label="Overall Score" />
        </div>
        <div className="card p-6 flex flex-col items-center gap-3">
          <ScoreRing score={result.readmeQuality?.score ?? 0} maxScore={10} size={90} color={getScoreColor(result.readmeQuality?.score ?? 0, 10)} label="README Quality" />
          <div className="text-xs text-[#475569]">{checksPassed}/5 checks passed</div>
        </div>
        <div className="card p-6 flex flex-col items-center gap-3">
          <ScoreRing score={result.presentationScore ?? 0} maxScore={10} size={90} color={getScoreColor(result.presentationScore ?? 0, 10)} label="Presentation" />
          <div className="flex flex-wrap gap-1 justify-center">
            {(result.presentationTags ?? []).slice(0, 3).map((t, i) => (
              <span key={i} className={`label-tag px-2 py-0.5 rounded-full text-xs ${t.status === 'good' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : t.status === 'warning' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'}`}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><FileText size={16} className="text-[#3B82F6]" />README Quality Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checkEntries.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${c.passed ? 'bg-[#10B981]/5 border border-[#10B981]/20' : 'bg-[#EF4444]/5 border border-[#EF4444]/20'}`}>
              {c.passed ? <CheckCircle size={16} className="text-[#10B981] shrink-0" /> : <XCircle size={16} className="text-[#EF4444] shrink-0" />}
              <span className={`text-sm ${c.passed ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {(result.techStackRelevance ?? []).length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><Code2 size={16} className="text-[#06B6D4]" />Tech Stack Relevance</h3>
          <div className="flex flex-col gap-4">
            {result.techStackRelevance.map((t, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#94A3B8] font-mono">{t.tech}</span>
                  <span className={t.color === 'green' ? 'text-[#10B981]' : t.color === 'amber' ? 'text-[#F59E0B]' : 'text-[#EF4444]'}>{t.relevancePercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#1E3A5F] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${t.color === 'green' ? 'bg-[#10B981]' : t.color === 'amber' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`} style={{ width: `${t.relevancePercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(result.projectImpactStatements ?? []).length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><Zap size={16} className="text-[#F59E0B]" />Impact Statement Rewrites</h3>
          <div className="flex flex-col gap-5">
            {result.projectImpactStatements.map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
                <div className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider mb-3">{p.projectName}</div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <div className="p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/20"><div className="text-xs font-mono text-[#EF4444] mb-1">Before</div><p className="text-xs text-[#94A3B8] leading-relaxed">{p.original}</p></div>
                  <div className="flex items-center justify-center py-2"><ArrowRight size={16} className="text-[#475569]" /></div>
                  <div className="p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20"><div className="text-xs font-mono text-[#10B981] mb-1">After</div><p className="text-xs text-[#94A3B8] leading-relaxed">{p.rewritten}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(result.missingProjects ?? []).length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><AlertCircle size={16} className="text-[#F59E0B]" />Recommended Projects to Add</h3>
          <div className="flex flex-col gap-3">
            {result.missingProjects.map((p, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-xs font-bold text-[#F59E0B] shrink-0">{i + 1}</span>
                <div><div className="text-sm font-semibold text-[#F8FAFC] mb-1">{p.type}</div><div className="text-xs text-[#94A3B8]">{p.reason}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PortfolioSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card p-6 flex flex-col items-center gap-3"><div className="shimmer w-24 h-24 rounded-full" /><div className="shimmer w-20 h-3 rounded" /></div>)}
      </div>
      <div className="card p-6"><div className="shimmer h-4 w-1/3 rounded mb-4" /><div className="grid grid-cols-2 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg" />)}</div></div>
      <div className="card p-6"><div className="shimmer h-4 w-1/4 rounded mb-4" />{[...Array(4)].map((_, i) => <div key={i} className="mb-3"><div className="shimmer h-3 w-1/3 rounded mb-1" /><div className="shimmer h-2 rounded-full" /></div>)}</div>
    </div>
  )
}
