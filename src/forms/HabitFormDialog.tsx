import { useEffect, useState } from "react"

import { HabitFormData, HabitFormDataInput, habitFormSchema } from "./schemas"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

import { CalendarSyncIcon } from "lucide-react"

import { AppleCalendarEvent, Habit } from "@/models"

function HabitForm({
  habit,
  calendarEventsFeatureEnabled,
  activeCalendarEvents,
  trigger,
  syncCalendarEvents,
  submit,
}: {
  calendarEventsFeatureEnabled: boolean
  activeCalendarEvents: AppleCalendarEvent[]
  trigger: React.ReactNode
  syncCalendarEvents: () => Promise<void>
} & (
  | {
      habit?: undefined
      submit: (formData: HabitFormData) => Promise<void>
    }
  | {
      habit: Habit
      submit: (formData: HabitFormData & { id: number }) => Promise<void>
    }
)) {
  const removeActiveEvents = (eventIds: string[]) => {
    return eventIds.filter(
      (id) => !activeCalendarEvents.find((event) => event.id === id)
    )
  }

  const [openDialog, setOpenDialog] = useState(false)

  const form = useForm<HabitFormDataInput>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: habit
      ? {
          title: habit.title,
          question: habit.question,
          habitType: habit.habitType,
          eventId: activeCalendarEvents.find((event) =>
            habit.eventIds.includes(event.id)
          )?.id,
        }
      : {
          habitType: calendarEventsFeatureEnabled ? undefined : "Daily",
        },
  })

  const [calendarEventsLoading, setCalendarEventsLoading] = useState(false)
  const syncCalendar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setCalendarEventsLoading(true)
    await syncCalendarEvents()
    setCalendarEventsLoading(false)
  }

  const onSubmit = async (formDataInput: HabitFormDataInput) => {
    const eventIds = [
      ...removeActiveEvents(habit?.eventIds ?? []),
      ...(formDataInput.eventId ? [formDataInput.eventId] : []),
    ]
    const formData: HabitFormData = {
      title: formDataInput.title,
      question: formDataInput.question,
      habitType: formDataInput.habitType,
      eventIds: eventIds,
    }
    if (habit) {
      await submit({ ...formData, id: habit.id })
    } else {
      await submit(formData)
      form.reset()
    }
    setOpenDialog(false)
  }

  useEffect(() => {
    // trigger eager validation on update
    if (habit) form.trigger()
  }, [habit])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>{habit ? "Update" : "Create"} Habit</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mb-8">
              {habit
                ? "Update the details of your habit."
                : "Fill out the details to create a new habit."}
            </DialogDescription>
            {!!calendarEventsFeatureEnabled && (
              <>
                <FormField
                  control={form.control}
                  name="habitType"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-5 mt-4">
                      <FormLabel>Type</FormLabel>
                      <div className="col-span-4">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(...events: any[]) => {
                              if (events[0] === "Daily") {
                                form.setValue("eventId", undefined)
                              }
                              field.onChange(...events)
                            }}
                            defaultValue={field.value}
                            className="flex gap-12"
                          >
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
                        <FormMessage className="absolute" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "apple-calendar-events",
                        form.watch("habitType") === "AppleCalendar"
                          ? "expanded"
                          : "collapsed"
                      )}
                    >
                      <FormLabel>Calendar events</FormLabel>
                      <div className="col-span-4">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? undefined}
                        >
                          <div className="flex gap-2">
                            <FormControl>
                              <SelectTrigger
                                className="w-full"
                                disabled={
                                  calendarEventsLoading ||
                                  activeCalendarEvents.length === 0
                                }
                              >
                                {calendarEventsLoading ? (
                                  <SelectValue placeholder="Loading..." />
                                ) : (
                                  <SelectValue
                                    placeholder={
                                      activeCalendarEvents.length > 0
                                        ? "Select a calendar event"
                                        : "Resync calendar events"
                                    }
                                  />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={syncCalendar}
                            >
                              <CalendarSyncIcon />
                            </Button>
                          </div>
                          <SelectContent>
                            {activeCalendarEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage className="absolute" />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
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
                    <FormMessage className="absolute" />
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
                    <FormMessage className="absolute" />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-8">
              <DialogClose asChild>
                <Button type="button" variant="outline">
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
