import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HabitEntry } from "@/models"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const datesAreEqual = (date1: Date, date2: Date) => {
  return date1.setHours(0, 0, 0, 0) === date2.setHours(0, 0, 0, 0)
}

export const getFirstTrackedDayOfMonth = (
  habitEntries: HabitEntry[]
): Date | undefined => {
  if (habitEntries.length === 0) {
    return undefined
  }
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
