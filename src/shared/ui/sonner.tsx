import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { Icon } from '@iconify/react'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: (
          <Icon icon="hugeicons:checkmark-circle-02" className="size-4" />
        ),
        info: <Icon icon="hugeicons:information-circle" className="size-4" />,
        warning: <Icon icon="hugeicons:alert-02" className="size-4" />,
        error: <Icon icon="hugeicons:cancel-circle" className="size-4" />,
        loading: (
          <Icon icon="hugeicons:loading-03" className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
