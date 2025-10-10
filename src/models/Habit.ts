import { HabitType } from "./HabitType"

export type Habit = {
  id: number
  habitType: HabitType
  eventIds: string[]
  title: string
  question: string
}
