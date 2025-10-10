import { useState } from "react"

import {
  useHabitStore,
  useHabitEntryStore,
  useAppleCalendarEventStore,
} from "@/store"

import HabitFormDialog from "@/forms/HabitFormDialog"
import HabitTrackerFormDialog from "@/forms/HabitTrackerFormDialog"

import { HabitTrackerCalendar } from "@/components/HabitTrackerCalendar"
import { HabitSummaryInfo } from "@/components/HabitSummaryInfo"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip"

import { CircleAlertIcon, PenBoxIcon } from "lucide-react"

import { cn } from "./lib/utils"
import {
  endOfDay,
  endOfMonth,
  isSameMonth,
  isToday,
  min,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { RRule, RRuleSet } from "rrule"

import {
  CreateHabitFormData,
  TrackHabitFormData,
  UpdateHabitFormData,
} from "./forms/schemas"

import { Habit, HabitEntry } from "@/models"

function Dashboard({
  trackHabits,
  createHabit,
  updateHabit,
}: {
  trackHabits: (formData: TrackHabitFormData) => Promise<void>
  createHabit: (formData: CreateHabitFormData) => Promise<void>
  updateHabit: (formData: UpdateHabitFormData) => Promise<void>
}) {
  const { habits } = useHabitStore()
  const { habitEntries, isTrackedToday } = useHabitEntryStore()
  const appleCalendarStore = useAppleCalendarEventStore()
  const activeCalendarEvents = appleCalendarStore.calendarEvents.filter(
    (event) =>
      event.rule.options.until === null || event.rule.options.until > new Date()
  )

  const [currentContext, setCurrentContext] = useState<HabitContext>(
    getHabitContext(habits[0])
  )

  function getHabitContext(habit: Habit): HabitContext {
    const filteredHabitEntries = habitEntries.filter(
      (entry) => entry.habitId === habit.id
    )
    const firstTrackedDay = startOfDay(
      filteredHabitEntries.length > 0
        ? min(filteredHabitEntries.map((entry) => entry.date))
        : new Date()
    )

    const habitEvents = appleCalendarStore.calendarEvents.filter((event) =>
      habit.eventIds.includes(event.id)
    )

    const rruleSet = new RRuleSet()
    rruleSet.rrule(
      new RRule({
        freq: RRule.DAILY,
        dtstart: firstTrackedDay,
        until: endOfMonth(new Date()),
        byhour: [20],
        byminute: [0],
        bysecond: [0],
      })
    )
    habitEvents.forEach((habit) => {
      rruleSet.exrule(
        new RRule({
          freq: RRule.DAILY,
          byhour: [20],
          byminute: [0],
          bysecond: [0],
          dtstart: habit.rule.options.dtstart,
          until: habit.rule.options.until,
        })
      )
      rruleSet.rrule(new RRule(habit.rule.options))
    })

    return {
      habit,
      habitEntries: filteredHabitEntries,
      firstTrackedDay,
      rruleSet,
    }
  }

  // context to HabitTrackerCalendar, i.e. current month being viewed
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date())

  return (
    <div className="h-screen flex items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center justify-center h-full w-40">
        {habits.length > 0 && (
          <>
            <div className="grow w-full flex flex-col gap-1 overflow-y-scroll">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center rounded-lg",
                    currentContext.habit?.id === habit.id
                      ? "bg-primary text-white"
                      : ""
                  )}
                >
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full"
                        disabled={currentContext.habit?.id === habit.id}
                        onClick={() =>
                          setCurrentContext(getHabitContext(habit))
                        }
                      >
                        <p className="overflow-hidden text-ellipsis">
                          {habit.title}
                          {habit.habitType === "AppleCalendar" &&
                            !activeCalendarEvents.find((event) =>
                              habit.eventIds.includes(event.id)
                            ) && (
                              <CircleAlertIcon
                                className="text-amber-400"
                                size={16}
                              />
                            )}
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{habit.title}</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
          </>
        )}

        <div className="flex flex-col justify-center items-center gap-1">
          <HabitFormDialog
            calendarEventsFeatureEnabled={appleCalendarStore.featureEnabled}
            activeCalendarEvents={activeCalendarEvents}
            submit={createHabit}
            syncCalendarEvents={appleCalendarStore.syncCalendarEvents}
            trigger={<Button variant="outline">Create a new habit</Button>}
          />
          {currentContext.habit && !isTrackedToday && (
            <HabitTrackerFormDialog
              habits={habits.filter((habit) => {
                const latestDateFromRuleset = getHabitContext(
                  habit
                ).rruleSet.before(endOfDay(new Date()), true)
                return !!latestDateFromRuleset && isToday(latestDateFromRuleset)
              })}
              trackHabits={trackHabits}
              trigger={<Button className="w-full">Track habits</Button>}
            />
          )}
        </div>
      </div>

      {currentContext.habit && (
        <>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center gap-8 h-full w-full justify-between px-4">
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-medium text-center">
                {currentContext.habit.title}
              </h3>
              <HabitFormDialog
                key={currentContext.habit.id} // force rerender for proper form update
                habit={currentContext.habit}
                submit={updateHabit}
                calendarEventsFeatureEnabled={appleCalendarStore.featureEnabled}
                activeCalendarEvents={activeCalendarEvents}
                syncCalendarEvents={appleCalendarStore.syncCalendarEvents}
                trigger={
                  <Button variant="ghost" size="icon" className="ml-1">
                    <PenBoxIcon size="1" />
                  </Button>
                }
              />
            </div>
            {/* total summary */}
            <HabitSummaryInfo
              habitEntries={currentContext.habitEntries}
              interval={currentContext.rruleSet.between(
                currentContext.firstTrackedDay,
                endOfDay(new Date()),
                true
              )}
              intervalLabel="Total"
              className="w-full"
            />
            <div className="grow flex flex-col gap-2 items-center justify-between border-3 rounded-lg border-dashed p-2">
              <HabitTrackerCalendar
                habitEntries={currentContext.habitEntries}
                firstTrackedDay={currentContext.firstTrackedDay}
                activeStartDate={activeStartDate}
                interval={currentContext.rruleSet.between(
                  currentContext.firstTrackedDay,
                  endOfMonth(activeStartDate),
                  true
                )}
                onMonthChange={setActiveStartDate}
              />
              {/* monthly summary */}
              <HabitSummaryInfo
                habitEntries={currentContext.habitEntries.filter((entry) =>
                  isSameMonth(entry.date, activeStartDate)
                )}
                interval={currentContext.rruleSet.between(
                  startOfMonth(activeStartDate),
                  min([endOfMonth(activeStartDate), endOfDay(new Date())]),
                  true
                )}
                intervalLabel="Monthly"
                className="w-9/10"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export type HabitContext = {
  habit: Habit
  habitEntries: HabitEntry[]
  firstTrackedDay: Date
  rruleSet: RRuleSet
}

export default Dashboard
