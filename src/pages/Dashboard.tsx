import { useState } from "react"
import { useHabitStore } from "../store/habit"
import { useHabitEntryStore } from "../store/habitEntry"

function Dashboard() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const [counter, setCounter] = useState(1)
  const addSampleHabit = async () => {
    await habitStore.createHabit({
      id: counter,
      habitType: counter % 2 === 0 ? "Daily" : "AppleCalendar",
      label: "Sample Habit " + counter,
      questionLabel: `Did you complete the sample habit ${counter} today?`,
    })
    setCounter(counter + 1)
  }
  const updateSampleHabit = async (habitId: number) => {
    await habitStore.updateHabit({
      id: habitId,
      habitType: "Daily",
      label: "Updated Sample Habit " + habitId,
      questionLabel: `Did you complete the updated sample habit ${habitId} today?`,
    })
  }
  const insertSampleHabitEntries = async () => {
    await habitEntryStore.insertHabitEntries([
      { id: 1, date: new Date(2022, 2, 2), habitId: 1, completed: true },
      { id: 2, date: new Date(2023, 2, 2), habitId: 2, completed: false },
    ])
  }

  return (
    <div>
      <h2>Habits</h2>
      <ul>
        {habitStore.habits.map((habit) => (
          <li key={habit.id}>
            Habit ID: {habit.id}
            Habit Type: {habit.habitType}
            Label: {habit.label}
            Question Label: {habit.questionLabel}
            <button onClick={() => updateSampleHabit(habit.id)}>
              Update Habit
            </button>
          </li>
        ))}
      </ul>
      <button onClick={insertSampleHabitEntries}>
        Insert Sample Habit Entries
      </button>
      <button onClick={addSampleHabit}>Add Sample Habit</button>
      <h2>Habit Entries</h2>
      <ul>
        {habitEntryStore.habitEntries.map((entry) => (
          <li key={entry.id}>
            Entry ID: {entry.id}
            Habit ID: {entry.habitId}
            Completed: {entry.completed ? "Yes" : "No"}
            Date: {entry.date.toDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard
