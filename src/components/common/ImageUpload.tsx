import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  /**
   * URL to show when no new file has been selected — typically a remote URL
   * loaded from the server. Pass `null`/`undefined` for empty.
   */
  previewUrl?: string | null
  onFileSelect: (file: File) => void
  onClear: () => void
  className?: string
}

export default function ImageUpload({
  previewUrl,
  onFileSelect,
  onClear,
  className,
}: ImageUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setLocalPreview(url)
      onFileSelect(file)
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  })

  function handleClear() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setLocalPreview(null)
    onClear()
  }

  const shown = localPreview ?? previewUrl ?? null

  if (shown) {
    return (
      <div className={cn('relative inline-block', className)}>
        <img
          src={shown}
          alt="Preview"
          className="h-40 w-40 rounded-lg border object-cover"
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
          aria-label="Remove image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex h-40 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary-400 bg-primary-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
        className,
      )}
    >
      <input {...getInputProps()} />
      <ImagePlus className="h-6 w-6 text-gray-400" />
      <p className="mt-2 text-xs font-medium text-gray-700">
        {isDragActive ? 'Drop here' : 'Upload image'}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">PNG, JPG up to 5MB</p>
    </div>
  )
}
