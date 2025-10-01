import { Calendar as ReactCalendar } from "react-calendar"

import { datesAreEqual } from "@/lib/utils"

import { HabitEntry } from "../../models"

function Calendar({ habitEntries }: { habitEntries: HabitEntry[] }) {
  return (
    <ReactCalendar
      tileDisabled={() => true}
      next2Label={null}
      prev2Label={null}
      minDetail="month"
      tileContent={({ date }) => {
        const habitEntry = habitEntries.find((habitEntry) =>
          datesAreEqual(habitEntry.date, date)
        )
        if (!habitEntry) {
          // a distinction between not entered and not completed
          return ""
        }
        return habitEntry.completed ? "✓" : "✗"
      }}
    />
  )
}

export { Calendar }
