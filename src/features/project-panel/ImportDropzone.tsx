import { useId, useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/shared/lib/utils'

interface ImportDropzoneProps {
  compact?: boolean
  onImportFiles: (files: File[]) => void
}

export function ImportDropzone({
  compact,
  onImportFiles,
}: ImportDropzoneProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  function handleFiles(list: FileList | null) {
    if (list && list.length > 0) onImportFiles(Array.from(list))
  }

  return (
    <label
      htmlFor={inputId}
      data-dragging={dragging || undefined}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong bg-surface-2 text-center text-[0.9rem] text-muted-foreground transition-colors hover:bg-accent-soft focus-within:outline-2 focus-within:outline-ring data-[dragging]:border-solid data-[dragging]:border-accent-solid data-[dragging]:bg-accent-soft',
        compact ? 'p-4' : 'p-10',
      )}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        handleFiles(event.dataTransfer.files)
      }}
    >
      <Icon icon="hugeicons:upload-01" className="size-5" aria-hidden="true" />
      <span className="font-medium text-foreground">
        {dragging ? 'Drop to import' : 'Drop files or browse'}
      </span>
      {!compact ? (
        <span>Video, audio and images. Files stay on your device.</span>
      ) : null}
      <input
        id={inputId}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </label>
  )
}
