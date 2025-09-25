import { useState } from "react"
import { useNavigation } from "../Navigation"

import Calendar from "../components/Calendar"

import { useHabitStore } from "../store/habit"
import { useHabitEntryStore } from "../store/habitEntry"

import { getFirstTrackedDayOfMonth } from "../date-helpers"

import { Habit, HabitCompletionRate, HabitWithCompletionRate } from "../models"

function Dashboard() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const { navigate } = useNavigation<"dashboard">()

  const firstTrackedDayOfMonth = getFirstTrackedDayOfMonth(
    habitEntryStore.habitEntries
  )

  const getMonthlyCompletionRate = (habit: Habit): HabitCompletionRate => {
    const entries = habitEntryStore.habitEntries.filter(
      (entry) =>
        entry.habitId === habit.id && entry.date >= firstTrackedDayOfMonth
    )

    const completed = entries.filter((entry) => entry.completed).length
    const total = new Date().getDate() - firstTrackedDayOfMonth.getDate() + 1

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

  return (
    <div>
      <ul>
        {habitsWithCompletionRates.map((habit) => (
          <li key={habit.id}>
            <strong>{habit.title}</strong>
            <button
              onClick={() => navigate("habitForm", { habitId: habit.id })}
            >
              Update habit
            </button>
            {!!habit.completionRate.total && (
              <p>
                {`${habit.completionRate.completed} / ${habit.completionRate.total}`}
              </p>
            )}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("habitForm", { habitId: undefined })}>
        Create new habit
      </button>

      <br />
      <br />
      {currentHabit && (
        <>
          <div>
            <button onClick={() => rotateCurrentHabit(-1)}>{"<"}</button>
            <p>{currentHabit.title}</p>
            {!!currentHabit.completionRate.total && (
              <p>
                {`${currentHabit.completionRate.completed} / ${currentHabit.completionRate.total}`}
              </p>
            )}
            <button onClick={() => rotateCurrentHabit(1)}>{">"}</button>
          </div>

          <Calendar
            habitEntries={habitEntryStore.habitEntries.filter(
              (entry) => entry.habitId === currentHabit.id
            )}
          />
          {!habitEntryStore.isTrackedToday && (
            <button onClick={() => navigate("habitTrackerForm")}>
              Track habits
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
