import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "../forms/schemas"
import { Habit, HabitEntry } from "../models"
import {
  CreateHabitRequest,
  Habit as HabitDto,
  HabitEntry as HabitEntryDto,
  InsertHabitEntriesRequest,
  UpdateHabitRequest,
} from "./dtos"

export const convertFormDataToCreateHabitRequest = (
  formData: CreateHabitFormData
): CreateHabitRequest => {
  return {
    habit_type: formData.habitType,
    title: formData.title,
    question: formData.question,
  }
}

export const convertFormDataToUpdateHabitRequest = (
  formData: UpdateHabitFormData
): UpdateHabitRequest => {
  return {
    id: formData.id,
    habit_type: formData.habitType,
    title: formData.title,
    question: formData.question,
  }
}

export const convertFormDataToInsertHabitEntriesRequest = (
  habitEntries: TrackHabitFormData
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
    title: dto.title,
    question: dto.question,
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
