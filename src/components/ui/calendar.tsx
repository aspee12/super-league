"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white text-black group/calendar p-3",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4 md:flex-row",
        month: "flex w-full flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 select-none p-0 aria-disabled:opacity-50"
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 select-none p-0 aria-disabled:opacity-50"
        ),
        month_caption: "flex h-8 w-full items-center justify-center px-8",
        dropdowns: "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium",
        dropdown_root: "relative rounded-md border border-gray-200 shadow-sm",
        dropdown: "bg-white absolute inset-0 opacity-0",
        caption_label: cn(
          "select-none font-medium text-sm text-black",
          captionLayout !== "label" &&
            "flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm"
        ),
        table: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-gray-500 flex-1 select-none rounded-md text-[0.8rem] font-normal w-8 text-center",
        week: "mt-2 flex w-full",
        week_number_header: "w-8 select-none",
        week_number: "text-gray-500 select-none text-[0.8rem]",
        day: "group/day relative aspect-square h-8 w-8 select-none p-0 text-center",
        range_start: "bg-gray-100 rounded-l-md",
        range_middle: "rounded-none",
        range_end: "bg-gray-100 rounded-r-md",
        today: "bg-gray-100 text-black rounded-md font-semibold",
        outside: "text-gray-400",
        disabled: "text-gray-300 opacity-50",
        hidden: "invisible",
        selected: "",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }
          return (
            <ChevronRightIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-8 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-normal h-8 w-8 transition-colors",
        "hover:bg-gray-100 hover:text-black",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
        modifiers.selected && "bg-black text-white hover:bg-gray-800 hover:text-white",
        modifiers.today && !modifiers.selected && "bg-gray-100 font-semibold",
        modifiers.disabled && "text-gray-300 pointer-events-none",
        modifiers.outside && "text-gray-400",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
