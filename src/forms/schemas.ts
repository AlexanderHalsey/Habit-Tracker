import z from "zod"

export const habitFormSchema = z
  .object({
    habitType: z.enum(["Daily", "AppleCalendar"], {
      error: "Required",
    }),
    eventId: z.string().optional(),
    title: z
      .string({ error: "Required" })
      .min(2, { error: "Too short" })
      .max(100),
    question: z
      .string({ error: "Required" })
      .min(2, { error: "Too short" })
      .max(100),
  })
  .superRefine((data, ctx) => {
    if (data.habitType === "AppleCalendar" && !data.eventId) {
      ctx.addIssue({
        code: "custom",
        message: "Required",
        path: ["eventId"],
      })
    }
  })

export type HabitFormDataInput = z.infer<typeof habitFormSchema>
export type HabitFormData = Omit<HabitFormDataInput, "eventId"> & {
  eventIds: string[]
}
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
