import { HabitType } from "./HabitType"

export type Habit = {
  id: number
  habitType: HabitType
  title: string
  question: string
}
