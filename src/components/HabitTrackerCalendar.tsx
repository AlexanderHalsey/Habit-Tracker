import { Calendar as ReactCalendar } from "react-calendar"

import { cn } from "@/lib/utils"
import { isSameDay, isSameMonth } from "date-fns"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { HabitEntry } from "@/models"

function HabitTrackerCalendar({
  habitEntries,
  firstTrackedDay,
  currentStartDate,
  onMonthChange,
}: {
  habitEntries: HabitEntry[]
  firstTrackedDay: Date | undefined
  currentStartDate: Date
  onMonthChange?: (date: Date) => void
}) {
  return (
    <ReactCalendar
      tileDisabled={() => true}
      minDetail="month"
      prev2Label={null}
      next2Label={null}
      prevLabel={
        firstTrackedDay && !isSameMonth(currentStartDate, firstTrackedDay) ? (
          <ChevronLeftIcon size="16" />
        ) : null
      }
      nextLabel={
        !isSameMonth(currentStartDate, new Date()) ? (
          <ChevronRightIcon size="16" />
        ) : null
      }
      tileClassName="relative h-full aspect-square"
      tileContent={({ date, activeStartDate }) => {
        if (!isSameMonth(date, activeStartDate)) {
          return <div className="absolute bg-white top-0 left-0 size-8"></div>
        }
        const habitEntry = habitEntries.find((habitEntry) =>
          isSameDay(habitEntry.date, date)
        )
        return (
          <div
            className={cn(
              "absolute top-1/7 left-1/7 size-8 rounded-full flex items-center justify-center",
              !!habitEntry
                ? habitEntry.completed
                  ? "text-white bg-primary"
                  : "text-white bg-secondary"
                : "bg-accent"
            )}
          >
            {date.getDate()}
          </div>
        )
      }}
      onActiveStartDateChange={({ activeStartDate }) =>
        activeStartDate && onMonthChange?.(activeStartDate)
      }
    />
  )
}

export { HabitTrackerCalendar }
