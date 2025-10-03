import { useState } from "react"

import { TrackHabitFormData, trackHabitFormSchema } from "./schemas"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"

import { Habit } from "@/models"

function HabitTrackerForm({
  habits,
  trackHabits,
  trigger,
}: {
  habits: Habit[]
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
  trigger: React.ReactNode
}) {
  const [openDialog, setOpenDialog] = useState(false)

  const form = useForm<TrackHabitFormData>({
    resolver: zodResolver(trackHabitFormSchema),
    defaultValues: {
      entries: habits.map((habit) => ({
        habitId: habit.id,
        completed: false,
      })),
    },
  })

  const onSubmit = async (formData: TrackHabitFormData) => {
    await trackHabits(formData)
    setOpenDialog(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Track Habits</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Select the habits you have completed today.
            </DialogDescription>
            <div className="flex flex-col gap-4 w-max my-8">
              {habits.map((habit, index) => (
                <FormField
                  key={habit.id}
                  control={form.control}
                  name={`entries.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 justify-between">
                      <FormLabel>{habit.question}</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value.completed}
                          onCheckedChange={(checked) => {
                            field.onChange({
                              ...field.value,
                              completed: !!checked,
                            })
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default HabitTrackerForm
