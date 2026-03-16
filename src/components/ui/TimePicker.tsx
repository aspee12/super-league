'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/Popover'
import { formatTime12h } from '@/lib/format-time'

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i)
const MINUTES = ['00', '15', '30', '45']

/** Convert 12h parts to 24h "HH:mm" for storage */
function to24h(hour12: number, minute: string, period: 'AM' | 'PM'): string {
  let h = hour12
  if (period === 'AM' && h === 12) h = 0
  else if (period === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Pick time',
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [activePeriod, setActivePeriod] = React.useState<'AM' | 'PM'>(() => {
    if (!value) return 'AM'
    const h = parseInt(value.split(':')[0], 10)
    return h >= 12 ? 'PM' : 'AM'
  })

  React.useEffect(() => {
    if (value) {
      const h = parseInt(value.split(':')[0], 10)
      setActivePeriod(h >= 12 ? 'PM' : 'AM')
    }
  }, [value])

  const current24 = value || ''

  const handleSelect = (hour12: number, minute: string) => {
    const time24 = to24h(hour12, minute, activePeriod)
    onChange(time24)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={
            'flex h-10 w-full items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm ring-offset-background transition-[color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
            (value ? '' : 'text-[var(--muted-foreground)]')
          }
        >
          <span>{value ? formatTime12h(value) : placeholder}</span>
          <Clock className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        {/* AM / PM toggle */}
        <div className="flex border-b border-gray-200">
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePeriod(p)}
              className={
                'flex-1 py-2 text-sm font-medium transition-colors ' +
                (activePeriod === p
                  ? 'bg-[#0e7490] text-white'
                  : 'text-gray-600 hover:bg-gray-50')
              }
            >
              {p}
            </button>
          ))}
        </div>

        {/* Time grid */}
        <div className="max-h-52 overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-1">
            {HOURS_12.map((h) =>
              MINUTES.map((m) => {
                const time24 = to24h(h, m, activePeriod)
                const isSelected = current24 === time24
                const label = `${h}:${m}`
                return (
                  <button
                    key={`${h}-${m}`}
                    type="button"
                    onClick={() => handleSelect(h, m)}
                    className={
                      'rounded-md px-2 py-1.5 text-sm text-center transition-colors ' +
                      (isSelected
                        ? 'bg-[#0e7490] text-white'
                        : 'hover:bg-gray-100 text-gray-700')
                    }
                  >
                    {label}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
