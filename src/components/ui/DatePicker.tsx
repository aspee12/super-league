'use client'

import * as React from 'react'
import { format, parse } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@ui/Calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/Popover'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  minDate?: Date
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  minDate,
  placeholder = 'Pick a date',
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const isValidDate = selected && !isNaN(selected.getTime())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={
            'flex h-10 w-full items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm ring-offset-background transition-[color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
            (isValidDate ? '' : 'text-[var(--muted-foreground)]')
          }
        >
          <span>{isValidDate ? format(selected, 'PPP') : placeholder}</span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? selected : undefined}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, 'yyyy-MM-dd'))
            }
            setOpen(false)
          }}
          disabled={minDate ? { before: minDate } : undefined}
          defaultMonth={isValidDate ? selected : new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
