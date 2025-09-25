import { useEffect, useState } from "react"

import Dashboard from "../pages/Dashboard"
import HabitForm from "../pages/HabitForm"
import HabitTrackerForm from "../pages/HabitTrackerForm"

import { useNavigation } from "../Navigation"

import { useHabitStore } from "../store/habit"
import { useHabitEntryStore } from "../store/habitEntry"

function MainLayout() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const { page } = useNavigation()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      await habitStore.fetchHabits()
      await habitEntryStore.fetchHabitEntries()
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main>
      {page === "dashboard" && <Dashboard />}
      {page === "habitForm" && <HabitForm />}
      {page === "habitTrackerForm" && <HabitTrackerForm />}
    </main>
  )
}

export default MainLayout
