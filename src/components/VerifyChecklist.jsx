import { CheckSquare, Square, ShieldCheck } from 'lucide-react'

export default function VerifyChecklist({ steps = [], checked = [], onToggle }) {
  const doneCount = checked.filter(Boolean).length
  const total = steps.length
  const progressPct = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck size={18} className="text-[#06B6D4]" />
        <h3 className="text-base font-semibold text-[#F8FAFC] font-grotesk">
          Verification Checklist
        </h3>
        <span className="label-tag text-[#94A3B8] ml-auto">
          {doneCount}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#1E3A5F] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#0D1B2A] hover:bg-[#1E3A5F]/30 transition-colors text-left w-full"
          >
            {checked[i] ? (
              <CheckSquare size={18} className="text-[#10B981] shrink-0 mt-0.5" />
            ) : (
              <Square size={18} className="text-[#475569] shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${checked[i] ? 'text-[#10B981] line-through' : 'text-[#94A3B8]'}`}>
              {step}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
