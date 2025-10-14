use chrono::Utc;
use habit_tracker_lib::{
    api::{AppleCalendarEvent, EventIds, HabitType},
    app_config::get_test_app_config,
    CreateHabitRequest, Habit, HabitTrackerService, InsertHabitEntriesRequest,
    InsertHabitEntryItem, UpdateHabitRequest,
};
use rusqlite::Result;
use std::error::Error;

fn mock_habit_tracker_service() -> Result<HabitTrackerService, Box<dyn Error>> {
    let app_config = get_test_app_config()?;
    Ok(HabitTrackerService::build(app_config)?)
}

#[test]
fn test_habit_methods() -> Result<(), Box<dyn Error>> {
    let habit_tracker_service = mock_habit_tracker_service()?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::Daily,
        event_ids: EventIds {
            values: vec!["eventId".to_owned()],
        },
        title: "some title".to_string(),
        question: "some question".to_string(),
    })?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::AppleCalendar,
        event_ids: EventIds { values: vec![] },
        title: "some other title".to_string(),
        question: "some other question".to_string(),
    })?;
    habit_tracker_service.update_habit(UpdateHabitRequest {
        id: 1,
        habit_type: HabitType::AppleCalendar,
        event_ids: EventIds {
            values: vec!["updatedEventId".into()],
        },
        title: "updated title".to_string(),
        question: "updated question".to_string(),
    })?;
    let habits = habit_tracker_service.get_habits()?;
    assert_eq!(habits.len(), 2);
    assert_eq!(
        habits,
        vec![
            Habit {
                id: 1,
                habit_type: HabitType::AppleCalendar,
                event_ids: EventIds {
                    values: vec!["updatedEventId".into()]
                },
                title: "updated title".to_string(),
                question: "updated question".to_string(),
            },
            Habit {
                id: 2,
                habit_type: HabitType::AppleCalendar,
                event_ids: EventIds { values: vec![] },
                title: "some other title".to_string(),
                question: "some other question".to_string(),
            }
        ],
    );
    Ok(())
}

#[test]
fn test_habit_entry_methods() -> Result<(), Box<dyn Error>> {
    let mut habit_tracker_service = mock_habit_tracker_service()?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::Daily,
        event_ids: EventIds {
            values: vec!["eventId".into()],
        },
        title: "some title".to_string(),
        question: "some question".to_string(),
    })?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::AppleCalendar,
        event_ids: EventIds { values: vec![] },
        title: "some other title".to_string(),
        question: "some other question".to_string(),
    })?;
    let habit_entries = habit_tracker_service.insert_habit_entries(InsertHabitEntriesRequest {
        data: vec![
            InsertHabitEntryItem {
                habit_id: 2,
                completed: true,
            },
            InsertHabitEntryItem {
                habit_id: 1,
                completed: false,
            },
        ],
    })?;
    assert_eq!(habit_entries.len(), 2);
    assert_eq!(
        (
            habit_entries[0].id,
            habit_entries[0].habit_id,
            habit_entries[0].completed
        ),
        (1, 2, true)
    );
    assert!((habit_entries[0].date - Utc::now()).num_seconds().abs() < 5);
    assert_eq!(
        (
            habit_entries[1].id,
            habit_entries[1].habit_id,
            habit_entries[1].completed
        ),
        (2, 1, false)
    );
    assert!((habit_entries[1].date - Utc::now()).num_seconds().abs() < 5);
    Ok(())
}

#[test]
fn test_apple_calendar_event_methods() -> Result<(), Box<dyn Error>> {
    let mut habit_tracker_service = mock_habit_tracker_service()?;
    let events = habit_tracker_service.reset_apple_calendar_events(vec![
        AppleCalendarEvent {
            id: "appleCalendarEventId1".to_string(),
            name: "appleCalendarEventName1".to_string(),
            start_date: Utc::now(),
            recurrence: "recurrence".to_string(),
        },
        AppleCalendarEvent {
            id: "appleCalendarEventId2".to_string(),
            name: "appleCalendarEventName2".to_string(),
            start_date: Utc::now(),
            recurrence: "recurrence".to_string(),
        },
        AppleCalendarEvent {
            id: "appleCalendarEventId3".to_string(),
            name: "appleCalendarEventName3".to_string(),
            start_date: Utc::now(),
            recurrence: "recurrence".to_string(),
        },
    ])?;
    assert_eq!(events.len(), 3);
    assert_eq!(
        (
            events[1].id.clone(),
            events[1].name.clone(),
            events[1].recurrence.clone()
        ),
        (
            "appleCalendarEventId2".to_string(),
            "appleCalendarEventName2".to_string(),
            "recurrence".to_string()
        )
    );
    assert!((events[1].start_date - Utc::now()).num_seconds().abs() < 5);
    let events = habit_tracker_service.reset_apple_calendar_events(vec![AppleCalendarEvent {
        id: "updatedAppleCalendarEventId1".to_string(),
        name: "updatedAppleCalendarEventName1".to_string(),
        start_date: Utc::now(),
        recurrence: "updatedRecurrence".to_string(),
    }])?;
    assert_eq!(events.len(), 1);
    assert_eq!(
        (
            events[0].id.clone(),
            events[0].name.clone(),
            events[0].recurrence.clone()
        ),
        (
            "updatedAppleCalendarEventId1".to_string(),
            "updatedAppleCalendarEventName1".to_string(),
            "updatedRecurrence".to_string(),
        )
    );
    assert!((events[0].start_date - Utc::now()).num_seconds().abs() < 5);
    Ok(())
}
