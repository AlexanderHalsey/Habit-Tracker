import { Label } from "@/components/ui/Label"
import { Progress } from "@/components/ui/Progress"

import { cn } from "@/lib/utils"
import { addDays, differenceInDays, endOfMonth, endOfYear } from "date-fns"

import { HabitEntry } from "@/models"

function HabitSummaryInfo({
  habitEntries,
  firstTrackedDay,
  year,
  month,
  className,
}: {
  habitEntries: HabitEntry[]
  firstTrackedDay: Date | undefined
  year?: number
  month?: number
} & React.HTMLAttributes<HTMLDivElement>) {
  firstTrackedDay = firstTrackedDay ?? new Date(1970, 0, 1) // Fallback to a very old date if no entries exist yet
  // Specify min date by a specific year and month or the first tracked day
  // Specify max date by a specific year and/or month or ensure all entries beyond the min date are included
  let minDate = firstTrackedDay
  let maxDate = new Date()
  if (month != undefined) {
    minDate = new Date(year ?? new Date().getFullYear(), month, 1)
    maxDate = endOfMonth(new Date(year ?? new Date().getFullYear(), month, 1))
  } else if (year != undefined) {
    minDate = new Date(year, 0, 1)
    maxDate = endOfYear(new Date(year, 6, 15))
  }

  // Ensure minDate is not before the first tracked day and maxDate is not in the future
  minDate = new Date(Math.max(minDate.getTime(), firstTrackedDay.getTime()))
  maxDate = new Date(Math.min(maxDate.getTime(), new Date().getTime()))

  // Filter entries to only include those within the specified year and/or month
  const summarizableEntries = habitEntries.filter((entry) => {
    return entry.date >= minDate && entry.date <= maxDate
  })

  const totalPossible = differenceInDays(addDays(maxDate, 1), minDate) // TODO: Include apple calendar type habits that are not necessarily supposed to be tracked daily
  const percentageTracked = Math.round(
    (summarizableEntries.length / totalPossible) * 100
  )

  const totalCompleted = summarizableEntries.filter((entry) => entry.completed)
  const percentageCompleted = Math.round(
    (totalCompleted.length / summarizableEntries.length) * 100
  )

  const habitTrackingPeriodLabel: "Total" | "Monthly" | "Yearly" =
    month !== undefined ? "Monthly" : year !== undefined ? "Yearly" : "Total"

  return (
    <div className={cn("flex flex-col gap-1 items-center", className)}>
      {totalPossible > 0 && (
        <>
          <Label>{habitTrackingPeriodLabel} tracking rate </Label>
          <Progress
            value={percentageTracked}
            max={100}
            className="h-3"
            children={"h"}
          />
          <div className="text-xs text-gray-400 flex justify-center mb-2">
            Tracked {percentageTracked}% ({summarizableEntries.length}/
            {totalPossible} days)
          </div>
        </>
      )}
      {summarizableEntries.length > 0 && (
        <>
          <Label>{habitTrackingPeriodLabel} completion rate </Label>
          <Progress value={percentageCompleted} className="bg-secondary h-3" />
          <div className="text-xs text-gray-400 flex justify-between w-full">
            <span>Victories {percentageCompleted}%</span>
            <span>
              ({totalCompleted.length}/{summarizableEntries.length} days)
            </span>
            <span>Setbacks {100 - percentageCompleted}%</span>
          </div>
        </>
      )}
    </div>
  )
}

export { HabitSummaryInfo }
