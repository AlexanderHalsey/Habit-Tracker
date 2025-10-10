import { invoke } from "@tauri-apps/api/core"
import {
  convertDtoToAppleCalendarEvent,
  convertDtoToHabit,
  convertDtoToHabitEntry,
  convertFormDataToCreateHabitRequest,
  convertFormDataToInsertHabitEntriesRequest,
  convertFormDataToUpdateHabitRequest,
} from "./converters"
import {
  AppleCalendarEvent as AppleCalendarEventDto,
  Habit as HabitDto,
  HabitEntry as HabitEntryDto,
} from "./dtos"
import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "../forms/schemas"
import { AppleCalendarEvent, Habit, HabitEntry } from "../models"

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

export const getAppleCalendarFeatureStatus = async (): Promise<boolean> => {
  return await invoke<boolean>("get_apple_calendar_feature_status")
}

export const getAppleCalendarEvents = async (): Promise<
  AppleCalendarEvent[]
> => {
  const response = await invoke<AppleCalendarEventDto[]>(
    "get_apple_calendar_events"
  )
  return response.map(convertDtoToAppleCalendarEvent)
}

export const syncAppleCalendarEvents = async (): Promise<
  AppleCalendarEvent[]
> => {
  const response = await invoke<AppleCalendarEventDto[]>(
    "sync_apple_calendar_events"
  )
  return response.map(convertDtoToAppleCalendarEvent)
}
