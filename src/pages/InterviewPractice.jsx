import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Send,
  Trophy,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { generateInterviewQuestion, scoreInterviewAnswer } from '../api/claude'
import { useClaude } from '../hooks/useClaude'
import { useTimer } from '../hooks/useTimer'
import { useToast } from '../hooks/useToast'
import ScoreRing from '../components/ScoreRing'
import TimerBar from '../components/TimerBar'
import StarChecker from '../components/StarChecker'
import Toast from '../components/Toast'
import EmptyState from '../components/EmptyState'
import { ROLES, QUESTION_TYPES, DIFFICULTIES } from '../utils/constants'

const LOADING_MESSAGES_Q = [
  'Crafting your question...',
  'Calibrating difficulty...',
  'Almost ready...',
]

const LOADING_MESSAGES_F = [
  'Evaluating your answer...',
  'Scoring with Claude AI...',
  'Building your feedback...',
  'Almost there...',
]

function getScoreColor(score, max = 10) {
  const pct = (score / max) * 100
  if (pct >= 70) return '#10B981'
  if (pct >= 40) return '#F59E0B'
  return '#EF4444'
}

export default function InterviewPractice() {
  // Setup state
  const [selectedRole, setSelectedRole] = useState('Software Engineer')
  const [selectedType, setSelectedType] = useState('Technical')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')

  // Session state
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sessionAnswers, setSessionAnswers] = useState([])
  const [allScores, setAllScores] = useState([])
  const [phase, setPhase] = useState('setup') // setup | question | feedback | complete

  // Model answer expand
  const [modelAnswerExpanded, setModelAnswerExpanded] = useState(false)

  // Loading messages
  const [loadingMsgQ, setLoadingMsgQ] = useState(LOADING_MESSAGES_Q[0])
  const [loadingMsgF, setLoadingMsgF] = useState(LOADING_MESSAGES_F[0])

  const questionClaude = useClaude()
  const feedbackClaude = useClaude()
  const timer = useTimer(120)
  const { toasts, success, error: toastError, warning } = useToast()
  const resultsRef = useRef(null)
  const qMsgRef = useRef(null)
  const fMsgRef = useRef(null)

  // Rotate question loading messages
  useEffect(() => {
    if (questionClaude.loading) {
      let idx = 0
      qMsgRef.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES_Q.length
        setLoadingMsgQ(LOADING_MESSAGES_Q[idx])
      }, 1800)
    } else {
      clearInterval(qMsgRef.current)
    }
    return () => clearInterval(qMsgRef.current)
  }, [questionClaude.loading])

  // Rotate feedback loading messages
  useEffect(() => {
    if (feedbackClaude.loading) {
      let idx = 0
      fMsgRef.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES_F.length
        setLoadingMsgF(LOADING_MESSAGES_F[idx])
      }, 1800)
    } else {
      clearInterval(fMsgRef.current)
    }
    return () => clearInterval(fMsgRef.current)
  }, [feedbackClaude.loading])

  // Timer expiry: auto-submit
  useEffect(() => {
    if (timer.isExpired && phase === 'question') {
      if (answer.trim().length > 0) {
        handleSubmitAnswer()
      } else {
        toastError("Time's up! Please write something.")
      }
    }
  }, [timer.isExpired])

  async function handleGenerateQuestion() {
    questionClaude.reset()
    feedbackClaude.reset()
    setFeedback(null)
    setAnswer('')
    setModelAnswerExpanded(false)
    timer.reset()

    const data = await questionClaude.run(
      generateInterviewQuestion,
      selectedRole,
      selectedType,
      selectedDifficulty,
      questionNumber
    )
    if (data) {
      setCurrentQuestion(data)
      setPhase('question')
      timer.start()
    }
  }

  async function handleSubmitAnswer() {
    if (answer.trim().length < 20) {
      toastError('Please write at least a sentence before submitting.')
      return
    }

    timer.stop()
    feedbackClaude.reset()

    const data = await feedbackClaude.run(
      scoreInterviewAnswer,
      currentQuestion.question,
      answer,
      selectedRole,
      selectedType
    )

    if (data) {
      setFeedback(data)
      setAllScores(prev => [...prev, data])
      setSessionAnswers(prev => [
        ...prev,
        { question: currentQuestion, answer, feedback: data },
      ])
      setPhase('feedback')
      success('Feedback ready!')
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }

  async function handleNextQuestion() {
    if (questionNumber >= 5) {
      setPhase('complete')
    } else {
      setQuestionNumber(prev => prev + 1)
      setAnswer('')
      setFeedback(null)
      feedbackClaude.reset()
      questionClaude.reset()
      setModelAnswerExpanded(false)
      timer.reset()

      // Auto-generate next question
      const nextNum = questionNumber + 1
      setCurrentQuestion(null)

      const data = await questionClaude.run(
        generateInterviewQuestion,
        selectedRole,
        selectedType,
        selectedDifficulty,
        nextNum
      )
      if (data) {
        setCurrentQuestion(data)
        setPhase('question')
        timer.start()
      }
    }
  }

  function handleRestart() {
    setPhase('setup')
    setQuestionNumber(1)
    setCurrentQuestion(null)
    setAnswer('')
    setFeedback(null)
    setSessionAnswers([])
    setAllScores([])
    setModelAnswerExpanded(false)
    timer.reset()
    questionClaude.reset()
    feedbackClaude.reset()
  }

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#475569] mb-3">
          <span>Tools</span>
          <ChevronRight size={12} />
          <span className="text-[#06B6D4]">Interview Practice</span>
        </div>
        <h1 className="text-3xl font-bold font-grotesk text-[#F8FAFC] mb-2">
          Interview Practice
        </h1>
        <p className="text-[#94A3B8]">
          Practice with AI-generated questions and get detailed feedback on every answer.
        </p>
      </div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <SetupCard
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          onGenerate={handleGenerateQuestion}
          loading={questionClaude.loading}
          loadingMsg={loadingMsgQ}
          error={questionClaude.error}
          onResetError={questionClaude.reset}
        />
      )}

      {/* Question Phase */}
      {(phase === 'question' || phase === 'feedback') && currentQuestion && (
        <div className="flex flex-col gap-6">
          {/* Progress + Timer */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    i < questionNumber
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]'
                      : 'bg-[#1E3A5F]'
                  }`}
                />
              ))}
              <span className="text-xs font-mono text-[#94A3B8] ml-2">
                Q{questionNumber} of 5
              </span>
            </div>

            {phase === 'question' && (
              <TimerBar
                display={timer.display}
                progress={timer.progress}
                isUrgent={timer.isUrgent}
                isCritical={timer.isCritical}
              />
            )}
          </div>

          {/* Question Card */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="label-tag px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                {currentQuestion.type}
              </span>
              <span className="label-tag px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                {selectedDifficulty}
              </span>
            </div>
            <p className="text-base text-[#F8FAFC] leading-relaxed font-grotesk mb-4">
              {currentQuestion.question}
            </p>
            {currentQuestion.tip && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                <Lightbulb size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
                <span className="text-xs text-[#94A3B8]">{currentQuestion.tip}</span>
              </div>
            )}
          </div>

          {/* Answer textarea */}
          {phase === 'question' && (
            <div className="card p-6 flex flex-col gap-3">
              <label className="text-sm font-semibold text-[#F8FAFC] font-grotesk">
                Your Answer
              </label>
              <textarea
                className="input-field p-4 text-sm leading-relaxed resize-none w-full"
                style={{ minHeight: '180px' }}
                placeholder="Type your answer here... Be specific and use the STAR method for behavioural questions."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                disabled={feedbackClaude.loading}
              />
              <div className="flex justify-between text-xs">
                <span
                  className={
                    wordCount < 50
                      ? 'text-[#F59E0B]'
                      : wordCount >= 100 && wordCount <= 250
                      ? 'text-[#10B981]'
                      : 'text-[#94A3B8]'
                  }
                >
                  {wordCount} words
                  {wordCount < 50 && ' (too short)'}
                  {wordCount >= 100 && wordCount <= 250 && ' (ideal)'}
                </span>
                <span className="text-[#475569]">{answer.length} chars</span>
              </div>

              {feedbackClaude.error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2D0F0F] border border-[#EF4444]/30">
                  <AlertCircle size={14} className="text-[#EF4444]" />
                  <span className="text-xs text-[#EF4444]">{feedbackClaude.error}</span>
                  <button onClick={feedbackClaude.reset} className="ml-auto text-xs text-[#94A3B8] hover:text-[#F8FAFC]">
                    <RefreshCw size={12} />
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={feedbackClaude.loading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {feedbackClaude.loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {loadingMsgF}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Answer →
                  </>
                )}
              </button>
            </div>
          )}

          {/* Feedback section */}
          {phase === 'feedback' && feedback && (
            <div ref={resultsRef} className="flex flex-col gap-6 animate-fade-up">
              {/* Score rings */}
              <div className="card p-6">
                <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-6 flex items-center gap-2">
                  <Zap size={16} className="text-[#3B82F6]" />
                  Performance Scores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                  <ScoreRing
                    score={feedback.overallScore ?? 0}
                    maxScore={10}
                    size={84}
                    color={getScoreColor(feedback.overallScore)}
                    label="Overall"
                  />
                  <ScoreRing
                    score={feedback.clarityScore ?? 0}
                    maxScore={10}
                    size={84}
                    color={getScoreColor(feedback.clarityScore)}
                    label="Clarity"
                  />
                  <ScoreRing
                    score={feedback.relevanceScore ?? 0}
                    maxScore={10}
                    size={84}
                    color={getScoreColor(feedback.relevanceScore)}
                    label="Relevance"
                  />
                  <ScoreRing
                    score={feedback.depthScore ?? 0}
                    maxScore={10}
                    size={84}
                    color={getScoreColor(feedback.depthScore)}
                    label="Depth"
                  />
                </div>
              </div>

              {/* STAR + Weak Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StarChecker starMethod={feedback.starMethod ?? {}} />

                <div className="card p-4">
                  <h4 className="text-sm font-semibold text-[#F8FAFC] font-grotesk mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#EF4444]" />
                    Areas to Improve
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(feedback.weakTags ?? []).map((tag, i) => (
                      <span key={i} className="label-tag px-2.5 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                        {tag}
                      </span>
                    ))}
                    {(feedback.weakTags ?? []).length === 0 && (
                      <span className="text-xs text-[#10B981]">No major weak areas!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeedbackList
                  title="Strengths"
                  items={feedback.strengths ?? []}
                  icon={<CheckCircle size={13} className="text-[#10B981]" />}
                  itemClass="text-[#10B981]"
                  bgClass="bg-[#10B981]/5 border-[#10B981]/20"
                />
                <FeedbackList
                  title="Improvements"
                  items={feedback.improvements ?? []}
                  icon={<XCircle size={13} className="text-[#EF4444]" />}
                  itemClass="text-[#EF4444]"
                  bgClass="bg-[#EF4444]/5 border-[#EF4444]/20"
                />
              </div>

              {/* Model Answer */}
              {feedback.modelAnswer && (
                <div className="card overflow-hidden">
                  <button
                    onClick={() => setModelAnswerExpanded(v => !v)}
                    className="w-full flex items-center justify-between p-5 hover:bg-[#1E3A5F]/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb size={16} className="text-[#F59E0B]" />
                      <span className="text-sm font-semibold text-[#F8FAFC] font-grotesk">
                        Model Answer
                      </span>
                      <span className="label-tag px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B]">
                        Ideal response
                      </span>
                    </div>
                    {modelAnswerExpanded ? (
                      <ChevronUp size={16} className="text-[#94A3B8]" />
                    ) : (
                      <ChevronDown size={16} className="text-[#94A3B8]" />
                    )}
                  </button>
                  <div
                    className="collapsible"
                    style={{
                      maxHeight: modelAnswerExpanded ? '400px' : '0',
                    }}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm text-[#94A3B8] leading-relaxed">
                        {feedback.modelAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Question / Complete */}
              <div className="flex gap-4">
                <button onClick={handleRestart} className="btn-secondary flex items-center gap-2">
                  <RotateCcw size={16} />
                  Restart
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={questionClaude.loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {questionClaude.loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating next question...
                    </>
                  ) : questionNumber >= 5 ? (
                    <>
                      <Trophy size={16} />
                      View Session Summary →
                    </>
                  ) : (
                    <>
                      Next Question ({questionNumber + 1}/5) →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Complete */}
      {phase === 'complete' && allScores.length > 0 && (
        <SessionComplete scores={allScores} onRestart={handleRestart} />
      )}
    </div>
  )
}

function SetupCard({
  selectedRole, setSelectedRole,
  selectedType, setSelectedType,
  selectedDifficulty, setSelectedDifficulty,
  onGenerate, loading, loadingMsg, error, onResetError,
}) {
  return (
    <div className="flex flex-col gap-6">
      <EmptyState
        icon={MessageSquare}
        title="Configure your interview session"
        description="Select a role, question type, and difficulty to begin your 5-question practice session."
      />

      <div className="card p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Target Role"
            value={selectedRole}
            onChange={setSelectedRole}
            options={ROLES}
          />
          <SelectField
            label="Question Type"
            value={selectedType}
            onChange={setSelectedType}
            options={QUESTION_TYPES}
          />
          <SelectField
            label="Difficulty"
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            options={DIFFICULTIES}
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2D0F0F] border border-[#EF4444]/30">
            <AlertCircle size={14} className="text-[#EF4444]" />
            <span className="text-xs text-[#EF4444] flex-1">{error}</span>
            <button onClick={onResetError} className="text-xs text-[#94A3B8]">
              <RefreshCw size={12} />
            </button>
          </div>
        )}

        <button
          onClick={onGenerate}
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
              <MessageSquare size={16} />
              Generate Question →
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono uppercase tracking-wider text-[#475569]">
        {label}
      </label>
      <select
        className="input-field px-4 py-3 text-sm w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-[#0D1B2A]">
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

function FeedbackList({ title, items, icon, itemClass, bgClass }) {
  return (
    <div className={`card p-4 border ${bgClass}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className={`text-xs leading-relaxed ${itemClass}`}>
            • {item}
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-[#475569]">None noted.</li>}
      </ul>
    </div>
  )
}

function SessionComplete({ scores, onRestart }) {
  const avg = (key) => {
    const vals = scores.map(s => s[key] ?? 0).filter(v => v > 0)
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0
  }

  const avgClarity = avg('clarityScore')
  const avgRelevance = avg('relevanceScore')
  const avgDepth = avg('depthScore')
  const avgOverall = avg('overallScore')

  // Collect weak tags
  const tagFreq = {}
  scores.forEach(s => {
    (s.weakTags ?? []).forEach(tag => {
      tagFreq[tag] = (tagFreq[tag] || 0) + 1
    })
  })
  const topWeakTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag)

  const radarData = [
    { subject: 'Clarity', score: avgClarity, fullMark: 10 },
    { subject: 'Relevance', score: avgRelevance, fullMark: 10 },
    { subject: 'Depth', score: avgDepth, fullMark: 10 },
    { subject: 'Overall', score: avgOverall, fullMark: 10 },
  ]

  function getScoreColor(score) {
    if (score >= 7) return '#10B981'
    if (score >= 4) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold font-grotesk text-[#F8FAFC] mb-2">
          Session Complete!
        </h2>
        <p className="text-[#94A3B8] text-sm">
          You completed all 5 questions. Here's your performance summary.
        </p>
      </div>

      {/* Radar chart */}
      <div className="card p-6">
        <h3 className="text-base font-semibold font-grotesk text-[#F8FAFC] mb-6">
          Performance Radar
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="#1E3A5F" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall', val: avgOverall },
          { label: 'Clarity', val: avgClarity },
          { label: 'Relevance', val: avgRelevance },
          { label: 'Depth', val: avgDepth },
        ].map(({ label, val }) => (
          <div key={label} className="card p-4 flex flex-col items-center gap-2">
            <span className="text-2xl font-bold font-grotesk" style={{ color: getScoreColor(val) }}>
              {val}
            </span>
            <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Top weak areas */}
      {topWeakTags.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold font-grotesk text-[#F8FAFC] mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#EF4444]" />
            Top Areas to Improve
          </h3>
          <div className="flex flex-wrap gap-3">
            {topWeakTags.map((tag, i) => (
              <span key={i} className="label-tag px-3 py-1.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRestart} className="btn-primary flex items-center justify-center gap-2">
        <RotateCcw size={16} />
        Start New Session
      </button>
    </div>
  )
}
