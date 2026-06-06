import { useEffect, useState } from 'react'

export default function ScoreRing({
  score = 0,
  maxScore = 100,
  size = 80,
  strokeWidth = 8,
  color = '#3B82F6',
  label = '',
  sublabel = '',
}) {
  const [animated, setAnimated] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / maxScore) * circumference
  const dashOffset = animated ? targetOffset : circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [score])

  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ display: 'block' }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#1E3A5F"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 1000ms ease',
          }}
        />
        {/* Center text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + size * 0.16}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize={size * 0.14}
          fontFamily="Inter, sans-serif"
        >
          /{maxScore}
        </text>
      </svg>
      {label && (
        <span className="text-xs font-medium text-[#94A3B8] text-center font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-[#475569] text-center">{sublabel}</span>
      )}
    </div>
  )
}

/**
 * Small inline score ring variant (for feedback cards)
 */
export function SmallScoreRing({ score, maxScore = 10, color = '#3B82F6', label }) {
  return (
    <ScoreRing
      score={score}
      maxScore={maxScore}
      size={72}
      strokeWidth={6}
      color={color}
      label={label}
    />
  )
}
