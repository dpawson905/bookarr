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
      const file = event.target.files?.[0]
      if (file && onPathSelect) {
        // For web applications, we can only get the file path in some browsers
        // In a real implementation, you might want to use a different approach
        // or handle this server-side
        onPathSelect(file.name)
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
