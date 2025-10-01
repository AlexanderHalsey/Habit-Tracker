import { useState } from "react"

import { useHabitStore } from "@/store"

import { getTrackHabitFormSchema, TrackHabitFormData } from "./schemas"

import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

function HabitTrackerForm({
  close,
  trackHabits,
}: {
  close: () => void
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
}) {
  const habitStore = useHabitStore()

  const [formData, setFormData] = useState<
    { habitId: number; completed: boolean }[]
  >(
    habitStore.habits.map((habit) => ({
      habitId: habit.id,
      completed: false,
    }))
  )

  const validate = async () => {
    const result = getTrackHabitFormSchema(habitStore.habits.length).safeParse(
      formData
    )
    if (!result.success) {
      console.error(result.error)
      return null
    }

    await trackHabits(result.data)
    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Track Habits</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 border border-red-500 w-max">
        {habitStore.habits.map((habit, index) => (
          <div
            key={habit.id}
            className="flex items-center gap-4 justify-between border border-green-500"
          >
            <Label htmlFor={`habit-${habit.id}`}>{habit.question}</Label>
            <Checkbox
              checked={formData[index].completed}
              id={`habit-${habit.id}`}
              onCheckedChange={(checked) => {
                const newFormData = [...formData]
                newFormData[index].completed = !!checked
                setFormData(newFormData)
              }}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
        <Button type="submit" onClick={validate}>
          Submit
        </Button>
      </DialogFooter>
    </>
  )
}

export default HabitTrackerForm
