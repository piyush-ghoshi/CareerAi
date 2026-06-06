import { Clock } from 'lucide-react'

export default function TimerBar({ display, progress, isUrgent, isCritical }) {
  const timerColor = isCritical
    ? 'text-[#EF4444]'
    : isUrgent
    ? 'text-[#F59E0B]'
    : 'text-[#F8FAFC]'

  const timerAnim = isCritical
    ? 'animate-[pulse_0.8s_infinite]'
    : isUrgent
    ? 'animate-pulse'
    : ''

  const barColor = isCritical
    ? 'bg-[#EF4444]'
    : isUrgent
    ? 'bg-[#F59E0B]'
    : 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Clock size={16} className={timerColor} />
        <span
          className={`font-mono text-2xl font-bold tracking-widest ${timerColor} ${timerAnim}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {display}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${progress}%`,
            transition: 'width 1s linear',
          }}
        />
      </div>
    </div>
  )
}
