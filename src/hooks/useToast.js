import { useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }

  function success(msg) { showToast(msg, 'success') }
  function error(msg) { showToast(msg, 'error') }
  function warning(msg) { showToast(msg, 'warning') }

  return { toasts, success, error, warning }
}
