import z from "zod"

export const habitFormSchema = z.object({
  habitType: z.enum(["Daily", "AppleCalendar"]),
  title: z.string().min(2).max(100),
  question: z.string().min(2).max(100),
})

export type CreateHabitFormData = z.infer<typeof habitFormSchema>

export type UpdateHabitFormData = CreateHabitFormData & { id: number }

export const getTrackHabitFormSchema = (habitLength: number) => {
  return z
    .array(
      z.object({
        habitId: z.number().min(1),
        completed: z.boolean(),
      })
    )
    .max(habitLength)
}

export type TrackHabitFormData = z.infer<
  ReturnType<typeof getTrackHabitFormSchema>
>
