import { useState } from "react"

import { useHabitStore, useHabitEntryStore } from "@/store"

import HabitFormDialog from "@/forms/HabitFormDialog"
import HabitTrackerFormDialog from "@/forms/HabitTrackerFormDialog"

import { HabitTrackerCalendar } from "@/components/HabitTrackerCalendar"
import { HabitSummaryInfo } from "@/components/HabitSummaryInfo"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"

import { PenBoxIcon } from "lucide-react"

import { cn } from "./lib/utils"
import { getYear } from "date-fns"

import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "./forms/schemas"

import { Habit, HabitEntry } from "@/models"

function Dashboard({
  trackHabits,
  createHabit,
  updateHabit,
}: {
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
  createHabit: (formData: CreateHabitFormData) => Promise<void>
  updateHabit: (formData: UpdateHabitFormData) => Promise<void>
}) {
  const { habits } = useHabitStore()
  const { habitEntries, isTrackedToday } = useHabitEntryStore()

  const getEntriesByHabit = (habit: Habit) => {
    return habitEntries.filter((entry) => entry.habitId === habit.id)
  }

  const [currentHabit, setCurrentHabit] = useState<Habit>(habits[0])
  const [currentHabitEntries, setCurrentHabitEntries] = useState<HabitEntry[]>(
    getEntriesByHabit(currentHabit)
  )
  const [currentStartDate, setCurrentStartDate] = useState<Date>(new Date())

  const firstTrackedDay =
    habitEntries.length > 0
      ? new Date(
          Math.min(...currentHabitEntries.map((entry) => entry.date.getTime()))
        )
      : undefined

  return (
    <div className="h-screen flex items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center justify-center h-full">
        {habits.length > 0 && (
          <div className="grow w-full flex flex-col gap-1">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  "flex items-center justify-between rounded-lg",

                  currentHabit?.id === habit.id ? "bg-primary text-white" : ""
                )}
              >
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={currentHabit?.id === habit.id}
                  onClick={() => {
                    setCurrentHabit(habit)
                    setCurrentHabitEntries(getEntriesByHabit(habit))
                  }}
                >
                  {habit.title}
                </Button>
              </div>
            ))}
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex flex-col justify-center items-center gap-1">
          <HabitFormDialog
            submit={createHabit}
            trigger={<Button variant="outline">Create a new habit</Button>}
          />
          {currentHabit && !isTrackedToday && (
            <HabitTrackerFormDialog
              habits={habits}
              trackHabits={trackHabits}
              trigger={<Button className="w-full">Track habits</Button>}
            />
          )}
        </div>
      </div>

      {currentHabit && (
        <>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center gap-8 h-full w-full justify-between">
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-medium">{currentHabit.title}</h3>
              <HabitFormDialog
                habit={currentHabit}
                submit={updateHabit}
                trigger={
                  <Button variant="ghost" size="icon" className="ml-1">
                    <PenBoxIcon size="1" />
                  </Button>
                }
              />
            </div>
            <HabitSummaryInfo
              habitEntries={currentHabitEntries}
              firstTrackedDay={firstTrackedDay}
              className="w-9/10"
            />
            <div className="grow flex flex-col gap-2 items-center justify-between border-3 rounded-lg border-dashed p-2">
              <HabitTrackerCalendar
                habitEntries={currentHabitEntries}
                firstTrackedDay={firstTrackedDay}
                currentStartDate={currentStartDate}
                onMonthChange={setCurrentStartDate}
              />
              {/* monthly summary */}
              <HabitSummaryInfo
                habitEntries={currentHabitEntries}
                firstTrackedDay={firstTrackedDay}
                year={getYear(currentStartDate)}
                month={currentStartDate.getMonth()}
                className="w-9/10"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
