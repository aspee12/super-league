'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudUpload, Plus, X } from 'lucide-react'

interface NewsImageDropzoneProps {
  readonly file: File | null
  readonly onFileChange: (file: File | null) => void
  readonly maxSizeMB?: number
  readonly id?: string
  /** Existing image URL shown as the preview when editing. */
  readonly existingImageUrl?: string
  readonly onClearExisting?: () => void
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function NewsImageDropzone({
  file,
  onFileChange,
  maxSizeMB = 1,
  id = 'news-image-upload',
  existingImageUrl,
  onClearExisting,
}: NewsImageDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxBytes = maxSizeMB * 1024 * 1024

  // Derived during render so the effect only handles revocation.
  const previewUrl = useMemo(
    () => (file?.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const displayUrl = previewUrl || (existingImageUrl && !file ? existingImageUrl : null)

  const accept = (candidate: File | undefined) => {
    if (!candidate) return
    if (candidate.size > maxBytes) {
      setSizeError(`Image must be under ${maxSizeMB} MB — that one is ${formatBytes(candidate.size)}.`)
      return
    }
    setSizeError(null)
    onFileChange(candidate)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    accept(e.dataTransfer.files?.[0])
  }

  const clear = () => {
    onFileChange(null)
    onClearExisting?.()
    setSizeError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const usedBytes = file?.size ?? 0
  const pct = Math.min(100, (usedBytes / maxBytes) * 100)

  return (
    <div className="w-full">
      <div
        className={`border rounded-[8px] pt-6 pb-10 px-6 flex flex-col gap-6 items-center transition-colors ${
          dragActive ? 'border-[#267c93] bg-[#267c93]/5' : 'border-[#e6e3df]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />

        {/* Controls + size meter */}
        <div className="flex items-start justify-between w-full">
          <div className="flex gap-3 items-start">
            <button
              type="button"
              aria-label="Choose image"
              onClick={() => inputRef.current?.click()}
              className="border-[1.5px] border-[#267c93] rounded-full p-2 flex items-center justify-center hover:bg-[#267c93]/5"
            >
              <Plus className="h-5 w-5 text-[#267c93]" />
            </button>
            <button
              type="button"
              aria-label="Remove image"
              onClick={clear}
              disabled={!file && !existingImageUrl}
              className="border-[1.5px] border-[#267c93] rounded-full p-2 flex items-center justify-center hover:bg-[#267c93]/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5 text-[#267c93]" />
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <p className="text-[14px] text-[#5f5955] whitespace-nowrap" style={{ lineHeight: '24px' }}>
              {formatBytes(usedBytes)}/ {maxSizeMB}MB
            </p>
            <div className="h-1 w-[133px] rounded-[2px] overflow-hidden bg-[#e6e3df]">
              <div className="h-full bg-[#267c93] transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Preview, or the empty drop target */}
        {displayUrl ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full max-h-[220px] rounded-[8px] overflow-hidden border border-[#e6e3df] bg-[#f3f3f5]"
          >
            <img src={displayUrl} alt="Selected cover" className="w-full h-full object-contain max-h-[220px]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col gap-2 items-center w-full"
          >
            <span className="border border-dashed border-[#9e9e9e] rounded-full p-3 flex items-center">
              <CloudUpload className="h-8 w-8 text-[#267c93]" />
            </span>
            <span className="text-[14px] text-[#5f5955]" style={{ lineHeight: '24px' }}>
              Drag and drop Image or click to choose.
            </span>
          </button>
        )}
      </div>

      {sizeError && <p className="text-sm text-red-600 mt-1">{sizeError}</p>}
    </div>
  )
}
