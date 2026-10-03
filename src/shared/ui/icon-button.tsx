import * as React from 'react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { formatShortcut } from '@/shared/shortcuts/registry'
import { cn } from '@/shared/lib/utils'

interface IconButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'size'
> {
  label: string
  shortcut?: string
  pressed?: boolean
  icon: React.ReactNode
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}

export function IconButton({
  label,
  shortcut,
  pressed,
  icon,
  className,
  variant = 'ghost',
  tooltipSide = 'bottom',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          aria-label={label}
          aria-pressed={pressed}
          data-pressed={pressed || undefined}
          className={cn(
            'size-7 min-h-6 min-w-6 p-0 data-[pressed]:bg-accent-soft data-[pressed]:text-foreground data-[pressed]:ring-1 data-[pressed]:ring-accent-solid',
            className,
          )}
          {...props}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        {label}
        {shortcut ? <Kbd>{formatShortcut(shortcut)}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  )
}

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <kbd
      className={cn(
        'ml-2 rounded border border-border-strong/60 px-1 font-mono text-[10px] leading-4',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
