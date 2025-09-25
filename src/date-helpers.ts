import { HabitEntry } from "./models"

export const datesAreEqual = (date1: Date, date2: Date) => {
  return date1.setHours(0, 0, 0, 0) === date2.setHours(0, 0, 0, 0)
}

export const getFirstTrackedDayOfMonth = (habitEntries: HabitEntry[]) => {
  const earliestEntryTimestamp = Math.min(
    ...habitEntries.map((entry) => entry.date.getTime())
  )
  const firstDayOfMonthTimestamp = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime()

  return new Date(Math.max(earliestEntryTimestamp, firstDayOfMonthTimestamp))
}
