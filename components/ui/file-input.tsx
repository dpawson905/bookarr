'use client'

import { forwardRef, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderOpen } from 'lucide-react'

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onPathSelect?: (path: string) => void
  buttonText?: string
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ onPathSelect, buttonText = 'Browse', className, ...props }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleBrowseClick = () => {
      fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (onPathSelect) {
          // For directory selection, extract the directory path
          if (file.webkitRelativePath) {
            // This is a directory selection - get the directory name
            const path = file.webkitRelativePath.split('/')[0]
            onPathSelect(path)
          } else {
            // This is a file selection - just use the filename
            onPathSelect(file.name)
          }
        }
      }
    }

    return (
      <div className="flex gap-2">
        <Input
          ref={ref}
          className={className}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowseClick}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          // For directory selection (if supported by browser)
          webkitdirectory=""
          directory=""
        />
      </div>
    )
  }
)

FileInput.displayName = 'FileInput'

export { FileInput }
