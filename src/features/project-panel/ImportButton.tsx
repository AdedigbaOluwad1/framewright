import { useRef } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/shared/ui/button'

interface ImportButtonProps {
  label: string
  accept: string
  onImportFiles: (files: File[]) => void
}

export function ImportButton({
  label,
  accept,
  onImportFiles,
}: ImportButtonProps) {
  const input = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size="lg" onClick={() => input.current?.click()}>
        <Icon icon="hugeicons:upload-01" aria-hidden="true" />
        {label}
      </Button>
      <p className="text-[0.8rem] text-muted-foreground">
        or drop files anywhere
      </p>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          if (event.target.files?.length)
            onImportFiles(Array.from(event.target.files))
          event.target.value = ''
        }}
      />
    </div>
  )
}
