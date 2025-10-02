import { useState } from "react"

import { useHabitStore, useHabitEntryStore } from "@/store"

import { getFirstTrackedDayOfMonth } from "@/lib/utils"

import HabitForm from "@/forms/HabitForm"
import HabitTrackerForm from "@/forms/HabitTrackerForm"

import { HabitTrackerCalendar } from "@/components/HabitTrackerCalendar"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog"
import { Separator } from "@/components/ui/Separator"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "./forms/schemas"
import { Habit, HabitCompletionRate, HabitWithCompletionRate } from "@/models"
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

    console.log(completed, total, firstTrackedDayOfMonth)

    return { completed, total }
  }

  const habitsWithCompletionRates: HabitWithCompletionRate[] =
    habitStore.habits.map((habit) => ({
      ...habit,
      completionRate: getMonthlyCompletionRate(habit),
    }))

  const [currentHabit, setCurrentHabit] = useState<HabitWithCompletionRate>(
    habitsWithCompletionRates[0]
  )

  const rotateCurrentHabit = (increment: 1 | -1) => {
    if (!currentHabit) {
      throw new Error("No current habit to rotate from")
    }
    const newIndex =
      (habitsWithCompletionRates.length +
        habitsWithCompletionRates.findIndex((h) => h.id === currentHabit.id) +
        increment) %
      habitsWithCompletionRates.length
    setCurrentHabit(habitsWithCompletionRates[newIndex])
  }

  const [openDialog1, setOpenDialog1] = useState(false)
  const [openDialog2, setOpenDialog2] = useState(false)
  const [openDialog3, setOpenDialog3] = useState(false)

  return (
    <div className="h-screen flex items-center gap-4 p-4">
      <div className="gap-6 flex flex-col justify-between h-full w-full">
        <h3 className="h-10 text-lg font-medium flex items-center justify-center">
          Habits for{" "}
          {new Intl.DateTimeFormat("en-GB", {
            month: "long",
          }).format(new Date())}
        </h3>
        <div className="grow">
          {habitsWithCompletionRates.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center justify-between pe-4 rounded-md ${
                currentHabit?.id === habit.id ? "bg-primary text-white" : ""
              }`}
            >
              <div className="flex items-center justify-center p-1 me-12">
                <Dialog open={openDialog1} onOpenChange={setOpenDialog1}>
                  <DialogTrigger asChild>
                    <Button variant="ghost">{habit.title}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <HabitForm
                      habit={habit}
                      updateHabit={updateHabit}
                      close={() => setOpenDialog1(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {!!habit.completionRate.total && (
                <strong>
                  {`${habit.completionRate.completed} / ${habit.completionRate.total}`}
                </strong>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center">
          <Dialog open={openDialog2} onOpenChange={setOpenDialog2}>
            <DialogTrigger asChild>
              <Button variant="outline">Create new habit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <HabitForm
                close={() => setOpenDialog2(false)}
                createHabit={createHabit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {currentHabit && (
        <>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center gap-6 h-full w-full justify-between">
            <div className="w-80 flex justify-between items-center gap-4">
              {habitStore.habits.length > 1 && (
                <Button variant="ghost" onClick={() => rotateCurrentHabit(-1)}>
                  <ChevronLeftIcon />
                </Button>
              )}
              <div className="grow flex gap-4 justify-center">
                <p>{currentHabit.title}</p>
                {!!currentHabit.completionRate.total && (
                  <strong>
                    {`${currentHabit.completionRate.completed} / ${currentHabit.completionRate.total}`}
                  </strong>
                )}
              </div>
              {habitStore.habits.length > 1 && (
                <Button variant="ghost" onClick={() => rotateCurrentHabit(1)}>
                  <ChevronRightIcon />
                </Button>
              )}
            </div>
            <div>
              <HabitTrackerCalendar
                habitEntries={habitEntryStore.habitEntries.filter(
                  (entry) => entry.habitId === currentHabit.id
                )}
              />
            </div>
            <div>
              <p>Hello there!</p>
              <p>And another p</p>
            </div>

            <Dialog open={openDialog3} onOpenChange={setOpenDialog3}>
              <DialogTrigger asChild>
                <Button
                  className={habitEntryStore.isTrackedToday ? "invisible" : ""}
                >
                  Track habits
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <HabitTrackerForm
                  close={() => setOpenDialog3(false)}
                  trackHabits={trackHabits}
                />
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
