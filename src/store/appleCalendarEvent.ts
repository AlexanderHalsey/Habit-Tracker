import { create } from "zustand"

import {
  getAppleCalendarEvents,
  getAppleCalendarFeatureStatus,
  syncAppleCalendarEvents,
} from "../api/habitTracker"

import { AppleCalendarEvent } from "../models"

interface State {
  featureEnabled: boolean
  calendarEvents: AppleCalendarEvent[]
}

interface Action {
  fetchFeatureStatus: () => Promise<boolean>
  fetchCalendarEvents: () => Promise<void>
  syncCalendarEvents: () => Promise<void>
}

export const useAppleCalendarEventStore = create<State & Action>((set) => ({
  featureEnabled: false,
  calendarEvents: [],
  fetchFeatureStatus: async (): Promise<boolean> => {
    const featureEnabled = await getAppleCalendarFeatureStatus()
    set({ featureEnabled })
    return featureEnabled
  },
  fetchCalendarEvents: async () => {
    const calendarEvents = await getAppleCalendarEvents()
    set({ calendarEvents })
  },
  syncCalendarEvents: async () => {
    const calendarEvents = await syncAppleCalendarEvents()
    set({ calendarEvents })
  },
}))
