import { Icon } from '@iconify/react'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  children?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 basis-0 flex-col items-center justify-center gap-3 p-6 text-center">
      <Icon
        icon={icon}
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="text-[0.95rem] font-medium">{title}</p>
      <p className="max-w-56 text-[0.9rem] text-muted-foreground">
        {description}
      </p>
      {children ? <div className="mt-2 w-full">{children}</div> : null}
    </div>
  )
}
