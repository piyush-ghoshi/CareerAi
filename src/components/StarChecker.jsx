import { CheckCircle, XCircle } from 'lucide-react'

const STAR_LABELS = {
  situation: { label: 'Situation', desc: 'Set the context' },
  task: { label: 'Task', desc: 'Your responsibility' },
  action: { label: 'Action', desc: 'What you did' },
  result: { label: 'Result', desc: 'The outcome' },
}

export default function StarChecker({ starMethod = {} }) {
  const keys = ['situation', 'task', 'action', 'result']
  const passCount = keys.filter(k => starMethod[k]).length

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-[#F8FAFC] font-grotesk">
          STAR Method
        </h4>
        <span className="label-tag text-[#94A3B8]">{passCount}/4</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {keys.map(key => {
          const passed = Boolean(starMethod[key])
          return (
            <div
              key={key}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                passed ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'
              }`}
            >
              {passed ? (
                <CheckCircle size={14} className="text-[#10B981] shrink-0" />
              ) : (
                <XCircle size={14} className="text-[#EF4444] shrink-0" />
              )}
              <div>
                <div className={`text-xs font-semibold ${passed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {STAR_LABELS[key].label}
                </div>
                <div className="text-xs text-[#475569]">{STAR_LABELS[key].desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
