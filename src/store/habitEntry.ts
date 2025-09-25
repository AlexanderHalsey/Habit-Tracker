import { create } from "zustand"

import { getHabitEntries, postHabitEntries } from "../api/habitTracker"

import { datesAreEqual } from "../date-helpers"
import { TrackHabitFormData } from "../forms"

import { HabitEntry } from "../models"

interface State {
  habitEntries: HabitEntry[]
  isTrackedToday: boolean
}

interface Action {
  fetchHabitEntries: () => Promise<void>
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
}

export const useHabitEntryStore = create<State & Action>((set, get) => ({
  habitEntries: [],
  isTrackedToday: false,
  fetchHabitEntries: async () => {
    const habitEntries = await getHabitEntries()
    const isTrackedToday = habitEntries.some((entry) =>
      datesAreEqual(entry.date, new Date())
    )
    set({ habitEntries, isTrackedToday })
  },
  trackHabits: async (formData) => {
    if (get().isTrackedToday) return
    await postHabitEntries(formData)
    const habitEntries = await getHabitEntries()
    set({ habitEntries, isTrackedToday: true })
  },
}))
