import { Calendar as ReactCalendar } from "react-calendar"

import { datesAreEqual } from "../date-helpers"

import { HabitEntry } from "../models"

function Calendar({ habitEntries }: { habitEntries: HabitEntry[] }) {
  return (
    <ReactCalendar
      tileDisabled={() => true}
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

export default Calendar
