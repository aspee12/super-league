"use client"

import { useState, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  readonly file: File | null
  readonly onFileChange: (file: File | null) => void
  readonly accept?: string
  readonly maxSizeMB?: number
  readonly id?: string
}

export function FileUpload({
  file,
  onFileChange,
  accept = "image/*",
  maxSizeMB = 10,
  id = "file-upload",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file?.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [file])

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

  return (
    <button
      type="button"
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
      onClick={() => document.getElementById(id)?.click()}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      {file ? (
        <div className="space-y-3">
          {previewUrl && file.type.startsWith("image/") ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white text-red-500 hover:text-red-700 shadow-md"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileChange(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-[#267c93] p-4 bg-gray-50 rounded-lg">
              <Upload className="h-5 w-5" />
              <span className="font-medium">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileChange(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
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
    </button>
  )
}
