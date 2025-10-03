import { useState } from "react"

import { HabitFormData, habitFormSchema } from "./schemas"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/Button"
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
import { Input } from "@/components/ui/Input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"

import { Habit } from "@/models"

function HabitForm({
  habit,
  trigger,
  submit,
}:
  | {
      habit?: undefined
      submit: (formData: HabitFormData) => Promise<void>
      trigger: React.ReactNode
    }
  | {
      habit: Habit
      submit: (formData: HabitFormData & { id: number }) => Promise<void>
      trigger: React.ReactNode
    }) {
  const [openDialog, setOpenDialog] = useState(false)

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: habit || {},
  })

  const onSubmit = async (formData: HabitFormData) => {
    if (habit) {
      await submit({ ...formData, id: habit.id })
    } else {
      await submit(formData)
    }
    setOpenDialog(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{habit ? "Update" : "Create"} Habit</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mb-8">
              {habit
                ? "Update the details of your habit."
                : "Fill out the details to create a new habit."}
            </DialogDescription>
            <FormField
              control={form.control}
              name="habitType"
              render={({ field }) => (
                <FormItem className="grid grid-cols-5 mt-4">
                  <FormLabel>Type</FormLabel>
                  <div className="col-span-4">
                    <FormControl>
                      <RadioGroup {...field} className="flex gap-12">
                        <FormItem className="flex gap-3">
                          <FormControl>
                            <RadioGroupItem value="Daily" />
                          </FormControl>
                          <FormLabel>Daily</FormLabel>
                        </FormItem>
                        <FormItem className="flex gap-3">
                          <FormControl>
                            <RadioGroupItem value="AppleCalendar" />
                          </FormControl>
                          <FormLabel>Apple Calendar</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid grid-cols-5 mt-4">
                  <FormLabel>Title</FormLabel>
                  <div className="col-span-4">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="grid grid-cols-5 mt-4">
                  <FormLabel>Question</FormLabel>
                  <div className="col-span-4">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-8">
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

export default HabitForm
