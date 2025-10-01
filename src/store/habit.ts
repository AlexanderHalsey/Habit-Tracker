import { create } from "zustand"

import { getHabits, postHabit, putHabit } from "../api/habitTracker"

import { CreateHabitFormData, UpdateHabitFormData } from "../forms/schemas"

import { Habit } from "../models"

interface State {
  habits: Habit[]
}

interface Action {
  fetchHabits: () => Promise<void>
  createHabit: (formData: CreateHabitFormData) => Promise<void>
  updateHabit: (formData: UpdateHabitFormData) => Promise<void>
}

export const useHabitStore = create<State & Action>((set) => ({
  habits: [],
  fetchHabits: async () => {
    const habits = await getHabits()
    set({ habits })
  },
  createHabit: async (formData: CreateHabitFormData) => {
    const habit = await postHabit(formData)
    set((state) => ({
      habits: [...state.habits, habit],
    }))
  },
  updateHabit: async (formData: UpdateHabitFormData) => {
    const updatedHabit = await putHabit(formData)
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit
      ),
    }))
  },
}))
