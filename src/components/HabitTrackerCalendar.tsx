import { Calendar as ReactCalendar } from "react-calendar"

import { cn } from "@/lib/utils"
import { isSameDay, isSameMonth } from "date-fns"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { HabitEntry } from "@/models"

function HabitTrackerCalendar({
  habitEntries,
  firstTrackedDay,
  activeStartDate,
  interval,
  onMonthChange,
}: {
  habitEntries: HabitEntry[]
  firstTrackedDay: Date
  activeStartDate: Date
  interval: Date[]
  onMonthChange?: (date: Date) => void
}) {
  return (
    <ReactCalendar
      tileDisabled={() => true}
      minDetail="month"
      prev2Label={null}
      next2Label={null}
      prevLabel={
        firstTrackedDay && !isSameMonth(activeStartDate, firstTrackedDay) ? (
          <ChevronLeftIcon size="16" />
        ) : null
      }
      nextLabel={
        !isSameMonth(activeStartDate, new Date()) ? (
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
              isSameDay(date, new Date()) && "outline-2 outline-gray-500",
              !!habitEntry
                ? habitEntry.completed
                  ? "bg-primary text-white"
                  : "bg-secondary text-white"
                : interval.some((d) => isSameDay(d, date))
                ? "bg-accent"
                : "bg-white"
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
