import { RRule } from "rrule"
import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "../forms/schemas"
import { AppleCalendarEvent, Habit, HabitEntry } from "../models"
import {
  AppleCalendarEvent as AppleCalendarEventDto,
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
    event_ids: { values: formData.eventIds },
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
    event_ids: { values: formData.eventIds },
    title: formData.title,
    question: formData.question,
  }
}

export const convertFormDataToInsertHabitEntriesRequest = (
  formData: TrackHabitFormData
): InsertHabitEntriesRequest => {
  return {
    data: formData.entries.map((entry) => ({
      habit_id: entry.habitId,
      completed: entry.completed,
    })),
  }
}

export const convertDtoToHabit = (dto: HabitDto): Habit => {
  return {
    id: dto.id,
    habitType: dto.habit_type,
    eventIds: dto.event_ids.values,
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

export const convertDtoToAppleCalendarEvent = (
  dto: AppleCalendarEventDto
): AppleCalendarEvent => {
  const options = RRule.parseString(dto.recurrence)
  options.dtstart = new Date(dto.start_date)
  // if (!options.until || options.until > new Date()) {
  //   options.until = new Date()
  // }
  return {
    id: dto.id,
    name: dto.name,
    rule: new RRule(options),
  }
}
