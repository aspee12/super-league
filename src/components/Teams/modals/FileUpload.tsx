"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  readonly file: File | null
  readonly onFileChange: (file: File | null) => void
  readonly accept?: string
  readonly maxSizeMB?: number
  readonly id?: string
  /** Existing image URL to show as preview when editing */
  readonly existingImageUrl?: string
  readonly onClearExisting?: () => void
}

export function FileUpload({
  file,
  onFileChange,
  accept = "image/*",
  maxSizeMB = 10,
  id = "file-upload",
  existingImageUrl,
  onClearExisting,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Derived rather than stored in state: setting it from an effect trips
  // react-hooks/set-state-in-effect and shows one frame without the preview.
  const previewUrl = useMemo(
    () => (file?.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  )

  // The memo may recompute; the dep on previewUrl means the cleanup always
  // revokes the URL it was paired with, so nothing leaks.
  useEffect(() => {
    if (!previewUrl) return
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayUrl = previewUrl || (existingImageUrl && !file ? existingImageUrl : null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.size <= maxSizeMB * 1024 * 1024) {
      onFileChange(selectedFile)
    } else if (selectedFile) {
      alert(`File size must be less than ${maxSizeMB} MB`)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.size <= maxSizeMB * 1024 * 1024) {
      onFileChange(droppedFile)
    } else if (droppedFile) {
      alert(`File size must be less than ${maxSizeMB} MB`)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onFileChange(null)
    onClearExisting?.()
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const hasContent = file || (existingImageUrl && !file)

  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${
          dragActive
            ? "border-[#267c93] bg-[#267c93]/5"
            : "border-gray-300 hover:border-gray-400"
        }
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      {displayUrl ? (
        <div className="space-y-3">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={displayUrl}
              alt={file?.name || "Current image"}
              className="w-full h-full object-contain"
            />
            <span
              role="button"
              tabIndex={0}
              className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-md bg-white/90 hover:bg-white text-red-500 hover:text-red-700 shadow-md cursor-pointer"
              onClick={handleRemove}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleRemove(e as unknown as React.MouseEvent)
              }}
            >
              <X className="h-4 w-4" />
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : "Current image"}
            </p>
            <p className="text-xs text-gray-500">Click to change file</p>
          </div>
        </div>
      ) : file ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#267c93] p-4 bg-gray-50 rounded-lg">
            <Upload className="h-5 w-5" />
            <span className="font-medium">{file.name}</span>
            <span
              role="button"
              tabIndex={0}
              className="h-6 w-6 flex items-center justify-center rounded-md text-red-500 hover:text-red-700 cursor-pointer"
              onClick={handleRemove}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleRemove(e as unknown as React.MouseEvent)
              }}
            >
              <X className="h-4 w-4" />
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">Click to change file</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="text-sm text-gray-600">
            Drop your files here or{" "}
            <span className="text-[#267c93] font-medium">Choose File</span>
          </p>
          <p className="text-xs text-gray-500">Upload file upto {maxSizeMB} mb</p>
        </div>
      )}
    </div>
  )
}
