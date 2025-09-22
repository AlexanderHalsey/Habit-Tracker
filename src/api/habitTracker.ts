import { invoke } from "@tauri-apps/api/core"
import {
  convertDtoToHabit,
  convertDtoToHabitEntry,
  convertFormDataToCreateHabitRequest,
  convertFormDataToInsertHabitEntriesRequest,
  convertFormDataToUpdateHabitRequest,
} from "./converters"
import { Habit as HabitDto, HabitEntry as HabitEntryDto } from "./dtos"
import { Habit, HabitEntry } from "../models"

export const getHabits = async (): Promise<Habit[]> => {
  const response = await invoke<HabitDto[]>("get_habits")
  return response.map(convertDtoToHabit)
}

export const postHabit = async (newHabit: Habit): Promise<Boolean> => {
  const response = await invoke<number>("create_habit", {
    request: convertFormDataToCreateHabitRequest(newHabit),
  })
  return !!response
}

export const putHabit = async (habit: Habit): Promise<Boolean> => {
  const response = await invoke<HabitDto>("update_habit", {
    request: convertFormDataToUpdateHabitRequest(habit),
  })
  return !!response
}

export const getHabitEntries = async (): Promise<HabitEntry[]> => {
  const response = await invoke<HabitEntryDto[]>("get_habit_entries")
  return response.map(convertDtoToHabitEntry)
}

export const postHabitEntries = async (
  newEntries: HabitEntry[]
): Promise<Boolean> => {
  return await invoke<Boolean>("insert_habit_entries", {
    request: convertFormDataToInsertHabitEntriesRequest(newEntries),
  })
}
