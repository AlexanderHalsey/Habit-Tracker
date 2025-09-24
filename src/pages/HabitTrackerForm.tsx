import { useState } from "react"

import { useNavigation } from "../Navigation"

import { useHabitEntryStore } from "../store/habitEntry"
import { useHabitStore } from "../store/habit"

import { getTrackHabitFormSchema } from "../forms"

function HabitTrackerForm() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const { navigate } = useNavigation<"habitTrackerForm">()

  const [formData, setFormData] = useState<
    { habitId: number; completed: boolean | undefined }[]
  >(
    habitStore.habits.map((habit) => ({
      habitId: habit.id,
      completed: undefined,
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

    await habitEntryStore.insertHabitEntries(result.data)
    navigate("dashboard")
  }

  return (
    <div>
      <button onClick={() => navigate("dashboard")}>Go Back</button>
      {habitStore.habits.map((habit, index) => (
        <div key={habit.id}>
          <span>{habit.title}</span>
          <input
            type="checkbox"
            checked={formData[index].completed === true}
            onChange={(e) => {
              const newFormData = [...formData]
              newFormData[index].completed = e.target.checked
              setFormData(newFormData)
            }}
          />
        </div>
      ))}

      <button onClick={validate}>Submit</button>
    </div>
  )
}

export default HabitTrackerForm
