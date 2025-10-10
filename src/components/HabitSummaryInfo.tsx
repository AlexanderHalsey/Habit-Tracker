import { Label } from "@/components/ui/Label"
import { Progress } from "@/components/ui/Progress"

import { cn } from "@/lib/utils"

import { HabitEntry } from "@/models"

function HabitSummaryInfo({
  habitEntries,
  interval,
  intervalLabel,
  className,
}: {
  habitEntries: HabitEntry[]
  interval: Date[]
  intervalLabel: "Total" | "Monthly" | "Yearly"
} & React.HTMLAttributes<HTMLDivElement>) {
  // calculate percentage of days tracked in the interval
  const totalPossible = interval.length
  const percentageTracked = Math.round(
    (habitEntries.length / totalPossible) * 100
  )
  const totalCompleted = habitEntries.filter((entry) => entry.completed)
  const percentageCompleted = Math.round(
    (totalCompleted.length / habitEntries.length) * 100
  )

  return (
    <div className={cn("flex flex-col gap-1 items-center", className)}>
      {totalPossible > 0 && (
        <>
          <Label>{intervalLabel} tracking rate </Label>
          <Progress
            value={percentageTracked}
            max={100}
            className="h-3"
            children={"h"}
          />
          <div className="text-xs text-gray-400 flex justify-center mb-2">
            Tracked {percentageTracked}% ({habitEntries.length}/{totalPossible}{" "}
            days)
          </div>
        </>
      )}
      {habitEntries.length > 0 && (
        <>
          <Label>{intervalLabel} completion rate </Label>
          <Progress value={percentageCompleted} className="bg-secondary h-3" />
          <div className="text-xs text-gray-400 flex justify-between w-full">
            <span>Victories {percentageCompleted}%</span>
            <span>
              ({totalCompleted.length}/{habitEntries.length} days)
            </span>
            <span>Setbacks {100 - percentageCompleted}%</span>
          </div>
        </>
      )}
    </div>
  )
}

export { HabitSummaryInfo }
