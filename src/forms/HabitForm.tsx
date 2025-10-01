import { useState } from "react"

import {
  CreateHabitFormData,
  habitFormSchema,
  UpdateHabitFormData,
} from "./schemas"

import { Button } from "@/components/ui/Button"
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"

import { Habit, HabitType } from "@/models"

function HabitForm({
  habit,
  close,
  createHabit,
  updateHabit,
}: {
  habit?: Habit
  close: () => void
  createHabit?: (formData: CreateHabitFormData) => Promise<void>
  updateHabit?: (formData: UpdateHabitFormData) => Promise<void>
}) {
  const [formData, setFormData] = useState<{
    habitType?: HabitType
    title?: string
    question?: string
  }>(habit ?? {})

  const validate = async () => {
    const result = habitFormSchema.safeParse(formData)
    if (!result.success) {
      console.error(result.error)
      return null
    }

    if (habit && !!updateHabit) {
      await updateHabit({
        id: habit.id,
        ...result.data,
      })
    } else if (!!createHabit) {
      await createHabit(result.data)
    }
    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{habit ? "Update" : "Create"} Habit</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-5 gap-4 mt-4">
        <Label htmlFor="habitType">Type</Label>
        <RadioGroup
          id="habitType"
          value={formData.habitType}
          className="col-span-4"
          onValueChange={(value) =>
            setFormData({ ...formData, habitType: value as HabitType })
          }
        >
          <div className="flex items-center space-x-4">
            <RadioGroupItem value="Daily" id="daily" />
            <Label htmlFor="daily">Daily</Label>
          </div>
          <div className="flex items-center space-x-4">
            <RadioGroupItem value="AppleCalendar" id="apple-calendar" />
            <Label htmlFor="apple-calendar">Apple Calendar</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          className="col-span-4"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-5 gap-4 mb-4">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={formData.question}
          className="col-span-4"
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
        />
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

export default HabitForm
