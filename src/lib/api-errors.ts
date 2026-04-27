import { AxiosError } from 'axios'

type FieldDetail = { field?: string; message?: string }

type BackendError = {
  error?: {
    code?: string
    message?: string
    details?: FieldDetail[] | unknown
  }
  message?: string
}

function formatDetails(details: FieldDetail[]): string {
  return details
    .map((d) => {
      const msg = (d?.message ?? '').trim()
      if (!msg) return ''
      const field = (d?.field ?? '').trim()
      return field ? `${field}: ${msg}` : msg
    })
    .filter(Boolean)
    .join('; ')
}

/**
 * Returns a human-readable message from an error thrown by axios.
 * For the backend's validation envelope
 *   `{ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: [...] } }`
 * we prefer the per-field details over the generic top-level message.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof AxiosError) {
    const body = err.response?.data as BackendError | undefined
    const rawDetails = body?.error?.details
    if (Array.isArray(rawDetails) && rawDetails.length > 0) {
      const formatted = formatDetails(rawDetails as FieldDetail[])
      if (formatted) return formatted
    }
    return body?.error?.message || body?.message || err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

export function getApiErrorStatus(err: unknown): number | undefined {
  if (err instanceof AxiosError) return err.response?.status
  return undefined
}
