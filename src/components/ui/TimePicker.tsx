'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
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

/** Split a stored 24h "HH:mm" into the 12h hour and minute shown in the inputs. */
function to12hParts(value: string): { hour: string; minute: string } {
  if (!value) return { hour: '', minute: '' }
  const [hStr, m] = value.split(':')
  const h = parseInt(hStr, 10)
  if (isNaN(h)) return { hour: '', minute: '' }
  return { hour: String(h % 12 === 0 ? 12 : h % 12), minute: m ?? '' }
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

  // The grid only offers quarter-hours, so kick-off times like 8:35 need a
  // typed entry. These hold the in-progress custom value until it's applied.
  const [customHour, setCustomHour] = React.useState('')
  const [customMinute, setCustomMinute] = React.useState('')

  const hourNum = parseInt(customHour, 10)
  const minuteNum = parseInt(customMinute, 10)
  const customValid =
    customHour !== '' &&
    customMinute !== '' &&
    !isNaN(hourNum) &&
    !isNaN(minuteNum) &&
    hourNum >= 1 &&
    hourNum <= 12 &&
    minuteNum >= 0 &&
    minuteNum <= 59

  // Seed the inputs from the current value each time the popover opens, so
  // editing starts from what's already selected rather than a blank field.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      const parts = to12hParts(value)
      setCustomHour(parts.hour)
      setCustomMinute(parts.minute)
    }
    setOpen(next)
  }

  const handleSelect = (hour12: number, minute: string) => {
    const time24 = to24h(hour12, minute, activePeriod)
    onChange(time24)
    setOpen(false)
  }

  const applyCustom = () => {
    if (!customValid) return
    onChange(to24h(hourNum, String(minuteNum).padStart(2, '0'), activePeriod))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
      <PopoverContent className="w-56 p-0" align="start">
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

        {/* Custom entry — type any hour/minute the grid below doesn't offer. */}
        <div className="border-b border-gray-200 p-2">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Hour"
              placeholder="hh"
              maxLength={2}
              value={customHour}
              onChange={(e) => setCustomHour(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyCustom()
                }
              }}
              className="h-8 w-11 rounded-md border border-gray-300 text-center text-sm text-gray-800 focus:border-[#0e7490] focus:outline-none"
            />
            <span className="text-sm font-semibold text-gray-500">:</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Minute"
              placeholder="mm"
              maxLength={2}
              value={customMinute}
              onChange={(e) => setCustomMinute(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyCustom()
                }
              }}
              className="h-8 w-11 rounded-md border border-gray-300 text-center text-sm text-gray-800 focus:border-[#0e7490] focus:outline-none"
            />
            <span className="text-xs font-medium text-gray-500">{activePeriod}</span>
            <button
              type="button"
              onClick={applyCustom}
              disabled={!customValid}
              className="ml-auto rounded-md bg-[#0e7490] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0c6380] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0e7490]"
            >
              Set
            </button>
          </div>
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
