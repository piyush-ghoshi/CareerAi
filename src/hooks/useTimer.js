import { useState, useEffect, useRef } from 'react'

export function useTimer(initialSeconds = 120) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef(null)

  function start() {
    setIsRunning(true)
    setIsExpired(false)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setTimeLeft(initialSeconds)
    setIsRunning(false)
    setIsExpired(false)
  }

  function stop() {
    clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const isUrgent = timeLeft <= 30
  const isCritical = timeLeft <= 10
  const progress = (timeLeft / initialSeconds) * 100

  return {
    timeLeft,
    display,
    isRunning,
    isExpired,
    isUrgent,
    isCritical,
    progress,
    start,
    reset,
    stop,
  }
}
