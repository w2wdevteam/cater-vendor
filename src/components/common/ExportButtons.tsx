import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'

interface ExportButtonsProps {
  filename: string
  /** Backend endpoint path (e.g. '/cater-admin/reports/monthly-by-company'). */
  endpoint?: string
  /** Query params forwarded to the endpoint; `format=excel` is added automatically. */
  params?: Record<string, string | number | undefined>
}

export default function ExportButtons({
  filename,
  endpoint,
  params,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!endpoint) {
      toast.success(`Exported ${filename}.xlsx`)
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.get<Blob>(endpoint, {
        params: { ...params, format: 'excel' },
        responseType: 'blob',
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to export file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Excel
      </Button>
    </div>
  )
}
