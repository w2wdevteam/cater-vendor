import { useEffect, useState } from 'react'

/**
 * Returns `value` debounced by `delayMs`. The returned value only updates
 * after the input has stopped changing for `delayMs` milliseconds.
 * Use this to wrap filter/search inputs before passing them into a query.
 */
export function useDebounce<T>(value: T, delayMs = 1000): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
