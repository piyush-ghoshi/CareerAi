export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count })

  const shimmerClass = 'shimmer rounded-xl'

  if (type === 'ring') {
    return (
      <div className="flex gap-8 flex-wrap">
        {items.map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`${shimmerClass} w-20 h-20 rounded-full`} />
            <div className={`${shimmerClass} w-16 h-3`} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'bar') {
    return (
      <div className="flex flex-col gap-3 w-full">
        {items.map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className={`${shimmerClass} w-1/3 h-3`} />
            <div className={`${shimmerClass} w-full h-4`} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className="flex flex-col gap-2 w-full">
        {items.map((_, i) => (
          <div key={i} className={`${shimmerClass} h-4 w-${i % 2 === 0 ? 'full' : '3/4'}`} />
        ))}
      </div>
    )
  }

  // Default: card
  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((_, i) => (
        <div key={i} className={`${shimmerClass} h-32 w-full`} />
      ))}
    </div>
  )
}

/**
 * Metric row skeleton (3 columns)
 */
export function MetricRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-6 flex flex-col items-center gap-3">
          <div className="shimmer w-20 h-20 rounded-full" />
          <div className="shimmer w-24 h-3 rounded" />
          <div className="shimmer w-16 h-3 rounded" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skills row skeleton
 */
export function SkillsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-4 flex flex-col gap-2">
          <div className="shimmer w-1/2 h-4 rounded" />
          {[...Array(4)].map((_, j) => (
            <div key={j} className="shimmer h-6 rounded-full w-20" />
          ))}
        </div>
      ))}
    </div>
  )
}
