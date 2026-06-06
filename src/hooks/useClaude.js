import { useState } from 'react'
import { mapApiError } from '../utils/parsers'

export function useClaude() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function run(apiFn, ...args) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await apiFn(...args)
      setResult(data)
      return data
    } catch (err) {
      const msg = mapApiError(err.message)
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setLoading(false)
    setError(null)
    setResult(null)
  }

  return { loading, error, result, run, reset }
}
