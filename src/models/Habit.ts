import { HabitType } from "./HabitType"

export type Habit = {
  id: number
  habitType: HabitType
  label: string
  questionLabel: string
}
