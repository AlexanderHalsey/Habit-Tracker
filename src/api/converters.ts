import { Habit, HabitEntry } from "../models"
import {
  CreateHabitRequest,
  Habit as HabitDto,
  HabitEntry as HabitEntryDto,
  InsertHabitEntriesRequest,
  UpdateHabitRequest,
} from "./dtos"

export const convertFormDataToCreateHabitRequest = (
  habit: Habit
): CreateHabitRequest => {
  return {
    habit_type: habit.habitType,
    label: habit.label,
    question_label: habit.questionLabel,
  }
}

export const convertFormDataToUpdateHabitRequest = (
  habit: Habit
): UpdateHabitRequest => {
  return {
    habit_id: habit.id,
    habit_type: habit.habitType,
    label: habit.label,
    question_label: habit.questionLabel,
  }
}

export const convertFormDataToInsertHabitEntriesRequest = (
  habitEntries: HabitEntry[]
): InsertHabitEntriesRequest => {
  return {
    data: habitEntries.map((entry) => ({
      habit_id: entry.habitId,
      completed: entry.completed,
    })),
  }
}

export const convertDtoToHabit = (dto: HabitDto): Habit => {
  return {
    id: dto.id,
    habitType: dto.habit_type,
    label: dto.label,
    questionLabel: dto.question_label,
  }
}

export const convertDtoToHabitEntry = (dto: HabitEntryDto): HabitEntry => {
  return {
    id: dto.id,
    habitId: dto.habit_id,
    completed: dto.completed,
    date: new Date(dto.date),
  }
}
