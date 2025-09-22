import { useState, useEffect } from "react";

import Dashboard from './pages/Dashboard'

import { useHabitStore } from './store/habit'
import { useHabitEntryStore } from './store/habitEntry'
import "./App.css";

function App() {
  const habitStore = useHabitStore()
  const habitEntryStore = useHabitEntryStore()

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await habitStore.fetchHabits()
      await habitEntryStore.fetchHabitEntries()
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Dashboard />
      )}
    </main>
  );
}

export default App;
