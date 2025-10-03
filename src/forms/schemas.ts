import z from "zod"

export const habitFormSchema = z.object({
  habitType: z.enum(["Daily", "AppleCalendar"], {
    error: "Required",
  }),
  title: z
    .string({ error: "Required" })
    .min(2, { error: "Too short" })
    .max(100),
  question: z
    .string({ error: "Required" })
    .min(2, { error: "Too short" })
    .max(100),
})

export type HabitFormData = z.infer<typeof habitFormSchema>
export type CreateHabitFormData = HabitFormData
export type UpdateHabitFormData = HabitFormData & { id: number }

export const trackHabitFormSchema = z.object({
  entries: z.array(
    z.object({
      habitId: z.number().min(1),
      completed: z.boolean(),
    })
  ),
})

export type TrackHabitFormData = z.infer<typeof trackHabitFormSchema>
