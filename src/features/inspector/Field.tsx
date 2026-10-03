import { useId } from 'react'
import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { Input } from '@/shared/ui/input'

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-3 border-b border-border p-4"
    >
      <h3
        id={id}
        className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  step?: number
  suffix?: string
  onCommit: (value: number) => void
}

export function NumberField({
  label,
  value,
  step = 1,
  suffix,
  onCommit,
}: NumberFieldProps) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor={id}
        className="w-16 shrink-0 text-[0.9rem] text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        defaultValue={value}
        key={value}
        className="tabular h-9 text-[0.9rem]"
        onBlur={(event) => {
          const next = Number(event.target.value)
          if (!Number.isNaN(next) && next !== value) onCommit(next)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
      {suffix ? (
        <span className="w-6 text-[0.8rem] text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onCommit: (value: number) => void
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onCommit,
}: SliderFieldProps) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <Label
        id={id}
        className="w-16 shrink-0 text-[0.9rem] text-muted-foreground"
      >
        {label}
      </Label>
      <Slider
        aria-labelledby={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onCommit(next)}
      />
      <span className="tabular w-12 shrink-0 text-right text-[0.9rem]">
        {format(value)}
      </span>
    </div>
  )
}
