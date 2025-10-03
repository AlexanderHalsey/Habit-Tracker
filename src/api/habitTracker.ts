import { invoke } from "@tauri-apps/api/core"
import {
  convertDtoToHabit,
  convertDtoToHabitEntry,
  convertFormDataToCreateHabitRequest,
  convertFormDataToInsertHabitEntriesRequest,
  convertFormDataToUpdateHabitRequest,
} from "./converters"
import { Habit as HabitDto, HabitEntry as HabitEntryDto } from "./dtos"
import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "../forms/schemas"
import { Habit, HabitEntry } from "../models"

export const getHabits = async (): Promise<Habit[]> => {
  const response = await invoke<HabitDto[]>("get_habits")
  return response.map(convertDtoToHabit)
}

export const postHabit = async (
  formData: CreateHabitFormData
): Promise<Habit> => {
  const response = await invoke<HabitDto>("create_habit", {
    request: convertFormDataToCreateHabitRequest(formData),
  })
  return convertDtoToHabit(response)
}

export const putHabit = async (
  formData: UpdateHabitFormData
): Promise<Habit> => {
  const response = await invoke<HabitDto>("update_habit", {
    request: convertFormDataToUpdateHabitRequest(formData),
  })
  return convertDtoToHabit(response)
}

export const getHabitEntries = async (): Promise<HabitEntry[]> => {
  const response = await invoke<HabitEntryDto[]>("get_habit_entries")
  return response.map(convertDtoToHabitEntry)
}

export const postHabitEntries = async (
  formData: TrackHabitFormData
): Promise<Boolean> => {
  return await invoke<Boolean>("insert_habit_entries", {
    request: convertFormDataToInsertHabitEntriesRequest(formData),
  })
}
