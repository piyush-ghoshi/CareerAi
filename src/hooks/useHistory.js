import { useState, useEffect } from 'react'

const STORAGE_KEYS = {
  resume: 'careerai_history_resume',
  interview: 'careerai_history_interview',
  portfolio: 'careerai_history_portfolio',
  scam: 'careerai_history_scam',
}

const MAX_HISTORY = 20

function loadHistory(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // localStorage full — ignore silently
  }
}

/**
 * useHistory(tool) — persists AI results to localStorage per tool.
 * tool: 'resume' | 'interview' | 'portfolio' | 'scam'
 */
export function useHistory(tool) {
  const storageKey = STORAGE_KEYS[tool]
  const [history, setHistory] = useState(() => loadHistory(storageKey))

  function addEntry(entry) {
    const item = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry,
    }
    setHistory(prev => {
      const next = [item, ...prev].slice(0, MAX_HISTORY)
      saveHistory(storageKey, next)
      return next
    })
    return item
  }

  function removeEntry(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id)
      saveHistory(storageKey, next)
      return next
    })
  }

  function clearHistory() {
    localStorage.removeItem(storageKey)
    setHistory([])
  }

  return { history, addEntry, removeEntry, clearHistory }
}

/**
 * Get total history count across all tools
 */
export function getAllHistoryCounts() {
  return Object.entries(STORAGE_KEYS).reduce((acc, [tool, key]) => {
    acc[tool] = loadHistory(key).length
    return acc
  }, {})
}

/**
 * Format a timestamp to readable "Jun 7, 2:30 PM"
 */
export function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
