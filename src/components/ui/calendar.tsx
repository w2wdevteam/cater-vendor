import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: 'absolute left-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 text-gray-600 opacity-50 hover:opacity-100',
        button_next: 'absolute right-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 text-gray-600 opacity-50 hover:opacity-100',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-[0.8rem] font-normal text-gray-500',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm relative p-0 [&:has(button)]:bg-transparent',
        day_button: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'aria-selected:opacity-100',
        ),
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        today: '[&>button]:bg-gray-100 [&>button]:text-gray-900',
        outside: 'text-gray-400 aria-selected:bg-gray-100/50 aria-selected:text-gray-400',
        disabled: 'text-gray-400 opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
