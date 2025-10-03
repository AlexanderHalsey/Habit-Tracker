import { HabitType } from "./HabitType"

export type Habit = {
  id: number
  habitType: HabitType
  title: string
  question: string
}

export type HabitCompletionRate = {
  completed: number
  total: number
}
