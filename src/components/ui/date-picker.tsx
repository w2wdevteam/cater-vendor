import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { CalendarIcon } from 'lucide-react'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from './calendar'

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  /** Matcher for dates that should be greyed out and unselectable. */
  disabled?: (date: Date) => boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const isValidDate = selected && !isNaN(selected.getTime())

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            !value && 'text-gray-400',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          {isValidDate ? format(selected, 'MMM d, yyyy') : <span>{placeholder}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 rounded-md border bg-white p-0 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={isValidDate ? selected : undefined}
            disabled={disabled}
            onSelect={(date) => {
              if (date) {
                onChange?.(format(date, 'yyyy-MM-dd'))
              } else {
                onChange?.('')
              }
              setOpen(false)
            }}
            defaultMonth={isValidDate ? selected : undefined}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
