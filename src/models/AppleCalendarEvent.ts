import { RRule } from "rrule"

export type AppleCalendarEvent = {
  id: string
  name: string
  rule: RRule
}
