import { useState, useRef, useEffect } from 'react'
import {
  Shield,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { detectJobScam } from '../api/claude'
import { useClaude } from '../hooks/useClaude'
import { useToast } from '../hooks/useToast'
import VerifyChecklist from '../components/VerifyChecklist'
import Toast from '../components/Toast'
import EmptyState from '../components/EmptyState'

const LOADING_MESSAGES = [
  'Scanning for red flags...',
  'Checking scam patterns...',
  'Analysing job posting...',
  'Almost there...',
]

const PATTERN_LABELS = {
  financialRedFlags: 'Financial Red Flags',
  vagueCompanyInfo: 'Vague Company Info',
  unrealisticSalary: 'Unrealistic Salary',
  urgencyPressure: 'Urgency Pressure',
  dataRequestRisk: 'Data Request Risk',
}

const SEVERITY_CONFIG = {
  high: { color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30', pill: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' },
  medium: { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', pill: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' },
  low: { color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', pill: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' },
}

const VERDICT_CONFIG = {
  SAFE: {
    bg: 'bg-[#0D2818]',
    border: 'border-[#10B981]',
    icon: CheckCircle,
    iconColor: 'text-[#10B981]',
    textColor: 'text-[#10B981]',
    label: 'SAFE',
  },
  SUSPICIOUS: {
    bg: 'bg-[#2D1F00]',
    border: 'border-[#F59E0B]',
    icon: AlertTriangle,
    iconColor: 'text-[#F59E0B]',
    textColor: 'text-[#F59E0B]',
    label: 'SUSPICIOUS',
  },
  SCAM: {
    bg: 'bg-[#2D0F0F]',
    border: 'border-pulse border-[#EF4444]',
    icon: XCircle,
    iconColor: 'text-[#EF4444]',
    textColor: 'text-[#EF4444]',
    label: 'SCAM',
  },
}

export default function ScamDetector() {
  const [jobPosting, setJobPosting] = useState('')
  const [hasChecked, setHasChecked] = useState(false)
  const [verifiedSteps, setVerifiedSteps] = useState([])
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])

  const { loading, error, result, run, reset } = useClaude()
  const { toasts, success, error: toastError, warning } = useToast()
  const resultsRef = useRef(null)
  const msgIntervalRef = useRef(null)

  useEffect(() => {
    if (loading) {
      let idx = 0
      msgIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length
        setLoadingMsg(LOADING_MESSAGES[idx])
      }, 1800)
    } else {
      clearInterval(msgIntervalRef.current)
      setLoadingMsg(LOADING_MESSAGES[0])
    }
    return () => clearInterval(msgIntervalRef.current)
  }, [loading])

  async function handleCheck() {
    if (jobPosting.length < 100) {
      toastError('Please paste the full job posting (minimum 100 characters).')
      return
    }

    const data = await run(detectJobScam, jobPosting)
    if (data) {
      setHasChecked(true)
      const steps = data.verificationSteps ?? []
      setVerifiedSteps(Array(steps.length).fill(false))

      if (data.verdict === 'SAFE') {
        success('This posting looks legitimate.')
      } else if (data.verdict === 'SUSPICIOUS') {
        warning('Proceed with caution — some red flags found.')
      } else {
        toastError('High scam risk detected!')
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }

  function handleToggleStep(index) {
    setVerifiedSteps(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#475569] mb-3">
          <span>Tools</span>
          <ChevronRight size={12} />
          <span className="text-[#06B6D4]">Scam Detector</span>
        </div>
        <h1 className="text-3xl font-bold font-grotesk text-[#F8FAFC] mb-2">
          Job Scam Detector
        </h1>
        <p className="text-[#94A3B8]">
          Paste any job posting to instantly detect fake opportunities, red flags, and scam patterns.
        </p>
      </div>

      {/* Input */}
      <div className="card p-6 flex flex-col gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC] font-grotesk">
          <Shield size={16} className="text-[#F59E0B]" />
          Job Posting
        </label>
        <textarea
          className="input-field p-4 text-sm leading-relaxed resize-none w-full"
          style={{ minHeight: '200px' }}
          placeholder="Paste the full job posting here...&#10;&#10;Include: Company name, job title, requirements, salary, contact info, application process"
          value={jobPosting}
          onChange={e => setJobPosting(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-between text-xs text-[#475569]">
          <span></span>
          <span className={jobPosting.length >= 100 ? 'text-[#10B981]' : ''}>
            {jobPosting.length} chars
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2D0F0F] border border-[#EF4444]/30">
            <AlertCircle size={14} className="text-[#EF4444]" />
            <span className="text-xs text-[#EF4444] flex-1">{error}</span>
            <button onClick={reset} className="text-xs text-[#94A3B8]">
              <RefreshCw size={12} />
            </button>
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {loadingMsg}
            </>
          ) : (
            <>
              <Shield size={16} />
              Check This Job →
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div ref={resultsRef}>
        {loading && <ScamSkeleton />}

        {!loading && !result && !hasChecked && (
          <EmptyState
            icon={Shield}
            title="No analysis yet"
            description="Paste a job posting above to check for scam indicators and red flags."
          />
        )}

        {!loading && result && (
          <ScamResults
            result={result}
            verifiedSteps={verifiedSteps}
            onToggleStep={handleToggleStep}
          />
        )}
      </div>
    </div>
  )
}

function ScamResults({ result, verifiedSteps, onToggleStep }) {
  const verdictCfg = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.SUSPICIOUS
  const VerdictIcon = verdictCfg.icon

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Verdict card */}
      <div className={`rounded-xl border p-6 ${verdictCfg.bg} ${verdictCfg.border}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${verdictCfg.bg} border ${verdictCfg.border}`}>
            <VerdictIcon size={28} className={verdictCfg.iconColor} />
          </div>
          <div className="flex-1">
            <div className={`text-2xl font-bold font-grotesk ${verdictCfg.textColor} mb-1`}>
              {verdictCfg.label}
            </div>
            <p className="text-sm text-[#94A3B8]">{result.verdictMessage}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold font-grotesk ${verdictCfg.textColor}`}>
              {result.trustScore}
            </div>
            <div className="text-xs text-[#475569] font-mono">Trust Score</div>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {(result.redFlags ?? []).length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#EF4444]" />
            Red Flags Detected ({result.redFlags.length})
          </h3>
          <div className="flex flex-col gap-4">
            {result.redFlags.map((flag, i) => {
              const sev = SEVERITY_CONFIG[flag.severity] ?? SEVERITY_CONFIG.low
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${sev.bg} border ${sev.border}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`label-tag px-2 py-0.5 rounded-full border text-xs ${sev.pill}`}>
                        {flag.category}
                      </span>
                      <span className={`label-tag px-2 py-0.5 rounded-full border uppercase text-xs ${sev.pill}`}>
                        {flag.severity}
                      </span>
                    </div>
                  </div>
                  {flag.flaggedText && (
                    <blockquote className={`text-xs font-mono italic mb-2 ${sev.color} border-l-2 ${sev.border} pl-3`}>
                      "{flag.flaggedText}"
                    </blockquote>
                  )}
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{flag.explanation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!result.redFlags?.length && (
        <div className="card p-6 flex items-center gap-3">
          <CheckCircle size={18} className="text-[#10B981]" />
          <span className="text-sm text-[#10B981]">No red flags detected in this posting.</span>
        </div>
      )}

      {/* Pattern Scores */}
      {result.patternScores && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="text-[#94A3B8]" />
            Scam Pattern Analysis
          </h3>
          <div className="flex flex-col gap-4">
            {Object.entries(result.patternScores).map(([key, val]) => {
              const barColor = val > 60 ? 'bg-[#EF4444]' : val >= 30 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
              const textColor = val > 60 ? 'text-[#EF4444]' : val >= 30 ? 'text-[#F59E0B]' : 'text-[#10B981]'
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94A3B8]">{PATTERN_LABELS[key] ?? key}</span>
                    <span className={`font-mono font-bold ${textColor}`}>{val}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E3A5F] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Verification Checklist */}
      {(result.verificationSteps ?? []).length > 0 && (
        <VerifyChecklist
          steps={result.verificationSteps}
          checked={verifiedSteps}
          onToggle={onToggleStep}
        />
      )}

      {/* Legitimate Rewrite */}
      {result.verdict === 'SCAM' && result.legitimateRewrite && (
        <div className="card p-6">
          <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-4 flex items-center gap-2">
            <FileText size={16} className="text-[#10B981]" />
            What a Legitimate Version Would Look Like
          </h3>
          <div className="p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20">
            <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
              {result.legitimateRewrite}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ScamSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="shimmer h-28 rounded-xl" />
      <div className="card p-6">
        <div className="shimmer h-4 w-1/3 rounded mb-4" />
        {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-20 rounded-xl mb-3" />)}
      </div>
      <div className="card p-6">
        <div className="shimmer h-4 w-1/4 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-3">
            <div className="shimmer h-3 w-1/3 rounded mb-1" />
            <div className="shimmer h-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
