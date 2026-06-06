import { useState, useEffect, useRef } from 'react'
import {
  FileText, Briefcase, AlertCircle, RefreshCw, ChevronRight,
  CheckCircle, XCircle, Lightbulb, TrendingUp, Target, Loader2,
  X, FileUp, Clock, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { analyseResume } from '../api/claude'
import { useClaude } from '../hooks/useClaude'
import { useToast } from '../hooks/useToast'
import { useHistory, formatTimestamp } from '../hooks/useHistory'
import ScoreRing from '../components/ScoreRing'
import Toast from '../components/Toast'
import EmptyState from '../components/EmptyState'
import { MetricRowSkeleton, SkillsRowSkeleton } from '../components/SkeletonLoader'

const LOADING_MESSAGES = [
  'Analysing with AI...',
  'Reading between the lines...',
  'Matching skills to the role...',
  'Generating your feedback...',
  'Almost there...',
]

function getScoreColor(score) {
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs', import.meta.url
  ).toString()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }
  return fullText.trim()
}

export default function ResumeAnalyser() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [hasAnalysed, setHasAnalysed] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeResult, setActiveResult] = useState(null)

  const fileInputRef = useRef(null)
  const { loading, error, result, run, reset } = useClaude()
  const { toasts, success, error: toastError } = useToast()
  const { history, addEntry, removeEntry, clearHistory } = useHistory('resume')
  const resultsRef = useRef(null)
  const msgIntervalRef = useRef(null)

  // Use latest AI result OR a history item
  const displayResult = activeResult ?? result

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

  async function handleFileSelect(file) {
    if (!file) return
    if (file.type !== 'application/pdf') { setPdfError('Only PDF files are supported.'); return }
    if (file.size > 10 * 1024 * 1024) { setPdfError('File too large. Max 10MB.'); return }
    setPdfError(null); setPdfLoading(true); setUploadedFile(file); setResumeText('')
    try {
      const text = await extractTextFromPDF(file)
      if (!text || text.length < 30) throw new Error('Could not extract text. Try a text-based PDF.')
      setResumeText(text)
      success(`Extracted ${text.split(/\s+/).filter(Boolean).length} words from ${file.name}`)
    } catch (err) {
      setPdfError(err.message || 'Failed to read PDF. Paste text manually.')
      setUploadedFile(null)
    } finally { setPdfLoading(false) }
  }

  async function handleAnalyse() {
    if (resumeText.length < 50 || jobDescription.length < 50) {
      toastError('Please provide resume and job description (min 50 chars each)')
      return
    }
    setActiveResult(null)
    const data = await run(analyseResume, resumeText, jobDescription)
    if (data) {
      setHasAnalysed(true)
      addEntry({ result: data, resumeSnippet: resumeText.slice(0, 120), jobSnippet: jobDescription.slice(0, 80) })
      success('Analysis complete!')
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    }
  }

  function loadHistoryItem(item) {
    setActiveResult(item.result)
    setShowHistory(false)
    setHasAnalysed(true)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#475569] mb-3">
            <span>Tools</span><ChevronRight size={12} /><span className="text-[#06B6D4]">Resume Analyser</span>
          </div>
          <h1 className="text-3xl font-bold font-grotesk text-[#F8FAFC] mb-2">Resume Analyser</h1>
          <p className="text-[#94A3B8]">Upload PDF or paste resume, add job description, get ATS + match analysis.</p>
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
            <h3 className="text-sm font-semibold font-grotesk text-[#F8FAFC] flex items-center gap-2">
              <Clock size={14} className="text-[#06B6D4]" />Previous Analyses
            </h3>
            <button onClick={clearHistory} className="text-xs text-[#475569] hover:text-[#EF4444] flex items-center gap-1 transition-colors">
              <Trash2 size={12} />Clear all
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-hide">
            {history.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] hover:border-[#3B82F6]/40 transition-colors cursor-pointer group"
                onClick={() => loadHistoryItem(item)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#475569]">{formatTimestamp(item.timestamp)}</span>
                    <span className="label-tag px-1.5 py-0.5 rounded" style={{ background: `${getScoreColor(item.result.matchScore ?? 0)}20`, color: getScoreColor(item.result.matchScore ?? 0) }}>
                      {item.result.matchScore ?? 0}% match
                    </span>
                    <span className="label-tag px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6]">
                      ATS {item.result.atsScore ?? 0}%
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] truncate">{item.jobSnippet}...</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); removeEntry(item.id) }}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors">
                    <X size={12} className="text-[#475569]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC] font-grotesk">
            <FileText size={16} className="text-[#3B82F6]" />Your Resume
          </label>
          {!uploadedFile && (
            <div onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 py-6 px-4"
              style={{ borderColor: isDragOver ? '#3B82F6' : '#1E3A5F', background: isDragOver ? 'rgba(59,130,246,0.05)' : 'rgba(13,27,42,0.5)' }}>
              {pdfLoading ? (
                <><Loader2 size={28} className="text-[#3B82F6] animate-spin" /><span className="text-xs text-[#94A3B8]">Reading PDF...</span></>
              ) : (
                <><div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <FileUp size={20} className="text-[#3B82F6]" /></div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#F8FAFC]">Drop PDF here or <span className="text-[#3B82F6]">browse</span></p>
                    <p className="text-xs text-[#475569] mt-1">PDF up to 10MB</p>
                  </div></>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFileSelect(e.target.files[0])} />
            </div>
          )}
          {uploadedFile && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
              <FileText size={16} className="text-[#10B981] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#10B981] truncate">{uploadedFile.name}</p>
                <p className="text-xs text-[#475569]">{wordCount(resumeText)} words extracted</p>
              </div>
              <button onClick={() => { setUploadedFile(null); setResumeText(''); setPdfError(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors">
                <X size={12} className="text-[#94A3B8]" />
              </button>
            </div>
          )}
          {pdfError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/20">
              <AlertCircle size={14} className="text-[#EF4444] shrink-0 mt-0.5" />
              <span className="text-xs text-[#EF4444]">{pdfError}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1E3A5F]" />
            <span className="text-xs text-[#475569] font-mono">or paste text</span>
            <div className="flex-1 h-px bg-[#1E3A5F]" />
          </div>
          <textarea className="input-field p-4 text-sm leading-relaxed resize-none w-full" style={{ minHeight: '140px' }}
            placeholder="Paste your resume text here..." value={resumeText}
            onChange={e => { setResumeText(e.target.value); if (e.target.value && uploadedFile) setUploadedFile(null) }}
            disabled={loading || pdfLoading} />
          <div className="flex justify-between text-xs text-[#475569]">
            <span>{wordCount(resumeText)} words</span>
            <span className={resumeText.length > 50 ? 'text-[#10B981]' : ''}>{resumeText.length} chars</span>
          </div>
        </div>
        <div className="card p-6 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC] font-grotesk">
            <Briefcase size={16} className="text-[#06B6D4]" />Job Description
          </label>
          <textarea className="input-field p-4 text-sm leading-relaxed resize-none flex-1 w-full" style={{ minHeight: '300px' }}
            placeholder="Paste the job description here..." value={jobDescription}
            onChange={e => setJobDescription(e.target.value)} disabled={loading} />
          <div className="flex justify-between text-xs text-[#475569]">
            <span>{wordCount(jobDescription)} words</span>
            <span className={jobDescription.length > 50 ? 'text-[#10B981]' : ''}>{jobDescription.length} chars</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2D0F0F] border border-[#EF4444]/30 mb-6">
          <AlertCircle size={16} className="text-[#EF4444] shrink-0" />
          <span className="text-sm text-[#EF4444] flex-1">{error}</span>
          <button onClick={reset} className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-mono flex items-center gap-1">
            <RefreshCw size={12} />Try again
          </button>
        </div>
      )}

      <button onClick={handleAnalyse} disabled={loading || pdfLoading}
        className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4">
        {loading ? <><Loader2 size={18} className="animate-spin" />{loadingMsg}</> : <><Target size={18} />Analyse Match →</>}
      </button>

      <div ref={resultsRef} className="mt-12">
        {loading && <div className="flex flex-col gap-8"><MetricRowSkeleton /><SkillsRowSkeleton /></div>}
        {!loading && !displayResult && !hasAnalysed && (
          <EmptyState icon={FileText} title="No analysis yet" description="Upload your resume PDF or paste text, add the job description, then click Analyse." />
        )}
        {!loading && displayResult && <ResultsSection result={displayResult} />}
      </div>
    </div>
  )
}

function ResultsSection({ result }) {
  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col items-center gap-3">
          <ScoreRing score={result.matchScore ?? 0} maxScore={100} size={90} color={getScoreColor(result.matchScore ?? 0)} label="Match Score" />
          <p className="text-xs text-[#475569] text-center">Resume–job compatibility</p>
        </div>
        <div className="card p-6 flex flex-col items-center gap-3">
          <ScoreRing score={result.atsScore ?? 0} maxScore={100} size={90} color={getScoreColor(result.atsScore ?? 0)} label="ATS Score" />
          <p className="text-xs text-[#475569] text-center">Automated screening pass rate</p>
        </div>
        <div className="card p-6 flex flex-col items-center gap-3">
          <div className="w-[90px] h-[90px] flex items-center justify-center rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20">
            <span className="text-3xl font-bold font-grotesk text-[#EF4444]">{result.missingSkillsCount ?? 0}</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">Missing Skills</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkillPillCard title="Skills Present" icon={<CheckCircle size={14} className="text-[#10B981]" />} skills={result.skillsPresent ?? []} pillClass="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" emptyMsg="No matching skills found" />
        <SkillPillCard title="Skills Missing" icon={<XCircle size={14} className="text-[#EF4444]" />} skills={result.skillsMissing ?? []} pillClass="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20" emptyMsg="No missing skills!" />
        <SkillPillCard title="Skills to Learn" icon={<TrendingUp size={14} className="text-[#F59E0B]" />} skills={result.skillsToLearn ?? []} pillClass="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20" emptyMsg="No suggestions" />
      </div>
      <div className="card p-6">
        <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><Target size={16} className="text-[#06B6D4]" />ATS Keywords</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3"><CheckCircle size={13} className="text-[#10B981]" /><span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">Found ({result.atsKeywordsPresent?.length ?? 0})</span></div>
            <div className="flex flex-wrap gap-2">
              {(result.atsKeywordsPresent ?? []).map((kw, i) => <span key={i} className="label-tag px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">{kw}</span>)}
              {!(result.atsKeywordsPresent?.length) && <span className="text-xs text-[#475569]">None found</span>}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><XCircle size={13} className="text-[#EF4444]" /><span className="text-xs font-mono uppercase tracking-wider text-[#EF4444]">Missing ({result.atsKeywordsMissing?.length ?? 0})</span></div>
            <div className="flex flex-wrap gap-2">
              {(result.atsKeywordsMissing ?? []).map((kw, i) => <span key={i} className="label-tag px-2.5 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">{kw}</span>)}
              {!(result.atsKeywordsMissing?.length) && <span className="text-xs text-[#475569]">All present!</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-5 flex items-center gap-2"><Lightbulb size={16} className="text-[#F59E0B]" />Improvement Tips</h3>
        <div className="flex flex-col gap-4">
          {(result.improvementTips ?? []).map((tip, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#0D1B2A] border border-[#1E3A5F]">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
              <div><div className="text-sm font-semibold text-[#F8FAFC] mb-1">{tip.tip}</div><div className="text-xs text-[#94A3B8] leading-relaxed">{tip.explanation}</div></div>
            </div>
          ))}
          {!(result.improvementTips?.length) && <p className="text-sm text-[#475569]">No specific tips — your resume looks strong!</p>}
        </div>
      </div>
    </div>
  )
}

function SkillPillCard({ title, icon, skills, pillClass, emptyMsg }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">{title} ({skills.length})</span></div>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? skills.map((s, i) => <span key={i} className={`label-tag px-2.5 py-1 rounded-full text-xs ${pillClass}`}>{s}</span>) : <span className="text-xs text-[#475569]">{emptyMsg}</span>}
      </div>
    </div>
  )
}
