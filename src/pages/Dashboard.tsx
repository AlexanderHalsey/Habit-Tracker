import { useNavigation } from "../Navigation"
import { useHabitStore } from "../store/habit"
import { useHabitEntryStore } from "../store/habitEntry"

function Dashboard() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const { navigate } = useNavigation<"dashboard">()

  return (
    <div>
      <h2>Habits</h2>
      <ul>
        {habitStore.habits.map((habit) => (
          <li key={habit.id}>
            Habit ID: {habit.id}
            Habit Type: {habit.habitType}
            Title: {habit.title}
            Question: {habit.question}
            <button
              onClick={() => navigate("habitForm", { habitId: habit.id })}
            >
              Update habit
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("habitForm", { habitId: undefined })}>
        Create new habit
      </button>
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
      <button onClick={() => navigate("habitTrackerForm")}>Track habits</button>
    </div>
  )
}

export default Dashboard
