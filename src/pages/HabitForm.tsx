import { useState } from "react"

import { useNavigation } from "../Navigation"

import { useHabitStore } from "../store/habit"

import { habitFormSchema } from "../forms"

import { HabitType } from "../models"

function HabitForm() {
  const habitStore = useHabitStore()
  const { params, navigate } = useNavigation<"habitForm">()
  const habit = habitStore.habits.find((h) => h.id === params?.habitId)

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

    if (habit) {
      await habitStore.updateHabit({
        id: habit.id,
        ...result.data,
      })
    } else {
      await habitStore.createHabit(result.data)
    }

    navigate("dashboard")
  }

  return (
    <div>
      <button onClick={() => navigate("dashboard")}>Go Back</button>
      <br />
      <br />
      <div>
        Habit Type:&nbsp;
        <input
          id="Daily"
          type="radio"
          name="habitType"
          value="Daily"
          checked={formData.habitType === "Daily"}
          onChange={() => setFormData({ ...formData, habitType: "Daily" })}
        />
        <label htmlFor="Daily">Daily</label>
        <input
          id="AppleCalendar"
          type="radio"
          name="habitType"
          value="AppleCalendar"
          checked={formData.habitType === "AppleCalendar"}
          onChange={() =>
            setFormData({ ...formData, habitType: "AppleCalendar" })
          }
        />
        <label htmlFor="AppleCalendar">Apple Calendar</label>
      </div>
      <br />
      <div>
        Title:&nbsp;
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <br />
      <div>
        Question:&nbsp;
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
        />
      </div>
      <br />
      <button onClick={validate}>{habit ? "Update" : "Add"} habit</button>
    </div>
  )
}

export default HabitForm
