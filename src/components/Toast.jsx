import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-[#0D2818]',
      border: 'border-[#10B981]',
      text: 'text-[#10B981]',
    },
    error: {
      icon: XCircle,
      bg: 'bg-[#2D0F0F]',
      border: 'border-[#EF4444]',
      text: 'text-[#EF4444]',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-[#2D1F00]',
      border: 'border-[#F59E0B]',
      text: 'text-[#F59E0B]',
    },
  }

  const { icon: Icon, bg, border, text } = config[toast.type] || config.success

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${border} shadow-2xl pointer-events-auto animate-slide-in min-w-[280px] max-w-[400px]`}
    >
      <Icon size={18} className={text} />
      <span className="text-sm text-[#F8FAFC] flex-1">{toast.message}</span>
    </div>
  )
}
