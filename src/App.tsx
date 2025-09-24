import { useEffect } from "react"

import Dashboard from "./pages/Dashboard"
import HabitForm from "./pages/HabitForm"
import HabitTrackerForm from "./pages/HabitTrackerForm"

import { useNavigation } from "./Navigation"

import { useHabitStore } from "./store/habit"
import { useHabitEntryStore } from "./store/habitEntry"

import "./App.css"

function App() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const { page } = useNavigation()

  useEffect(() => {
    const fetchData = async () => {
      await habitStore.fetchHabits()
      await habitEntryStore.fetchHabitEntries()
    }
    fetchData()
  }, [])

  return (
    <main>
      {page === "dashboard" && <Dashboard />}
      {page === "habitForm" && <HabitForm />}
      {page === "habitTrackerForm" && <HabitTrackerForm />}
    </main>
  )
}

export default App
