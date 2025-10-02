import { Calendar as ReactCalendar } from "react-calendar"

import { datesAreEqual } from "@/lib/utils"

import { Button } from "./ui/Button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { HabitEntry } from "@/models"

function HabitTrackerCalendar({
  habitEntries,
}: {
  habitEntries: HabitEntry[]
}) {
  return (
    <ReactCalendar
      tileDisabled={() => true}
      minDetail="month"
      next2Label={null}
      prev2Label={null}
      nextLabel={
        <Button variant="ghost">
          <ChevronRightIcon size="16" />
        </Button>
      }
      prevLabel={
        <Button variant="ghost">
          <ChevronLeftIcon size="16" />
        </Button>
      }
      tileClassName={() => {
        let tileClassName = "relative h-full aspect-square"
        return tileClassName
      }}
      tileContent={({ date, activeStartDate }) => {
        if (date.getMonth() !== activeStartDate.getMonth()) {
          return <div className="absolute bg-white top-0 left-0 size-8"></div>
        }
        const habitEntry = habitEntries.find((habitEntry) =>
          datesAreEqual(habitEntry.date, date)
        )
        return (
          <div
            className={`absolute top-1/7 left-1/7 size-8 rounded-full flex items-center justify-center ${
              !!habitEntry
                ? habitEntry.completed
                  ? "text-white bg-blue-500"
                  : "text-white bg-amber-400"
                : "bg-accent"
            }`}
          >
            {date.getDate()}
          </div>
        )
      }}
    />
  )
}

export { HabitTrackerCalendar }
