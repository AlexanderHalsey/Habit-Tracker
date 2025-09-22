import { create } from "zustand"
import { getHabitEntries, postHabitEntries } from "../api/habitTracker"
import { HabitEntry } from "../models"

interface State {
  habitEntries: HabitEntry[]
}

interface Action {
  fetchHabitEntries: () => Promise<void>
  insertHabitEntries: (newEntries: HabitEntry[]) => Promise<void>
}

export const useHabitEntryStore = create<State & Action>((set) => ({
  habitEntries: [],
  fetchHabitEntries: async () => {
    const habitEntries = await getHabitEntries()
    set({ habitEntries })
  },
  insertHabitEntries: async (newEntries) => {
    await postHabitEntries(newEntries)
    const habitEntries = await getHabitEntries()
    set({ habitEntries })
  },
}))
