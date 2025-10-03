import { useState } from "react"

import { useHabitStore, useHabitEntryStore } from "@/store"

import { getFirstTrackedDayOfMonth } from "@/lib/utils"

import HabitFormDialog from "@/forms/HabitFormDialog"
import HabitTrackerFormDialog from "@/forms/HabitTrackerFormDialog"

import { HabitTrackerCalendar } from "@/components/HabitTrackerCalendar"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"

import { PenBoxIcon } from "lucide-react"

import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "./forms/schemas"

import { Habit, HabitCompletionRate } from "@/models"

function Dashboard({
  trackHabits,
  createHabit,
  updateHabit,
}: {
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
  createHabit: (formData: CreateHabitFormData) => Promise<void>
  updateHabit: (formData: UpdateHabitFormData) => Promise<void>
}) {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const firstTrackedDayOfMonth =
    getFirstTrackedDayOfMonth(habitEntryStore.habitEntries) || new Date()

  const getMonthlyCompletionRate = (habit: Habit): HabitCompletionRate => {
    const entries = habitEntryStore.habitEntries.filter(
      (entry) =>
        entry.habitId === habit.id && entry.date >= firstTrackedDayOfMonth
    )

    const completed = entries.filter((entry) => entry.completed).length
    const total = new Date().getDate() - firstTrackedDayOfMonth.getDate() + 1

    return { completed, total }
  }

  const [currentHabit, setCurrentHabit] = useState<Habit>(habitStore.habits[0])

  return (
    <div className="h-screen flex items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center justify-center h-full">
        {habitStore.habits.length > 0 && (
          <div className="grow w-full flex flex-col gap-1">
            {habitStore.habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center justify-between rounded-lg ${
                  currentHabit?.id === habit.id ? "bg-primary text-white" : ""
                }`}
              >
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={currentHabit?.id === habit.id}
                  onClick={() => setCurrentHabit(habit)}
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
          {currentHabit && !habitEntryStore.isTrackedToday && (
            <HabitTrackerFormDialog
              habits={habitStore.habits}
              trackHabits={trackHabits}
              trigger={<Button className="w-full">Track habits</Button>}
            />
          )}
        </div>
      </div>

      {currentHabit && (
        <>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center gap-6 h-full w-full justify-between">
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
            <div>
              <p>Hello there!</p>
              <p>And another p</p>
            </div>

            {/* {!!currentHabit.completionRate.total && (
                  <strong>
                    {`${currentHabit.completionRate.completed} / ${currentHabit.completionRate.total}`}
                  </strong>
                )} */}
            <div>
              <HabitTrackerCalendar
                habitEntries={habitEntryStore.habitEntries.filter(
                  (entry) => entry.habitId === currentHabit.id
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
