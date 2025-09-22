import { create } from "zustand"
import { getHabits, postHabit, putHabit } from "../api/habitTracker"
import { Habit } from "../models"

interface State {
  habits: Habit[]
}

interface Action {
  fetchHabits: () => Promise<void>
  createHabit: (newHabit: Habit) => Promise<void>
  updateHabit: (updatedHabit: Habit) => Promise<void>
}

export const useHabitStore = create<State & Action>((set) => ({
  habits: [],
  fetchHabits: async () => {
    const habits = await getHabits()
    set({ habits })
  },
  createHabit: async (newHabit) => {
    await postHabit(newHabit)
    set((state) => ({
      habits: [...state.habits, newHabit],
    }))
  },
  updateHabit: async (updatedHabit) => {
    await putHabit(updatedHabit)
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit
      ),
    }))
  },
}))
