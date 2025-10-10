import { useEffect, useState } from "react"

import Dashboard from "./Dashboard"

import {
  useHabitStore,
  useHabitEntryStore,
  useAppleCalendarEventStore,
} from "@/store"

import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "./forms/schemas"

function App() {
  const appleCalendarEventStore = useAppleCalendarEventStore()
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const [loading, setLoading] = useState(true)

  const trackHabits = async (formData: TrackHabitFormData) => {
    setLoading(true)
    await habitEntryStore.trackHabits(formData)
    setLoading(false)
  }

  const createHabit = async (formData: CreateHabitFormData) => {
    setLoading(true)
    await habitStore.createHabit(formData)
    setLoading(false)
  }

  const updateHabit = async (formData: UpdateHabitFormData) => {
    setLoading(true)
    await habitStore.updateHabit(formData)
    setLoading(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      await habitStore.fetchHabits()
      await habitEntryStore.fetchHabitEntries()
      const appleCalendarFeatureIsEnabled =
        await appleCalendarEventStore.fetchFeatureStatus()
      if (appleCalendarFeatureIsEnabled) {
        await appleCalendarEventStore.fetchCalendarEvents()
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <main>Loading...</main>
  }

  return (
    <main>
      <Dashboard
        trackHabits={trackHabits}
        createHabit={createHabit}
        updateHabit={updateHabit}
      />
    </main>
  )
}

export default App
