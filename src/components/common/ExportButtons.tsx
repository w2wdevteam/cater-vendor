import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ExportButtonsProps {
  formats?: ('csv' | 'excel' | 'pdf')[]
  filename: string
}

export default function ExportButtons({
  formats = ['csv', 'excel', 'pdf'],
  filename,
}: ExportButtonsProps) {
  function handleExport(format: string) {
    toast.success(`Exported ${filename}.${format === 'excel' ? 'xlsx' : format}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Download className="h-4 w-4 text-gray-400" />
      {formats.map((fmt) => (
        <Button
          key={fmt}
          variant="outline"
          size="sm"
          onClick={() => handleExport(fmt)}
        >
          {fmt === 'excel' ? 'Excel' : fmt.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
