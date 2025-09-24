use chrono::Utc;
use habit_tracker_lib::{
    app_config::get_app_config, CreateHabitRequest, Habit, HabitTrackerService, HabitType,
    InsertHabitEntriesRequest, InsertHabitEntryItem, UpdateHabitRequest,
};
use rusqlite::Result;
use std::error::Error;

fn mock_habit_tracker_service() -> Result<HabitTrackerService, Box<dyn Error>> {
    let app_config = get_app_config("test")?;
    Ok(HabitTrackerService::build(app_config)?)
}

#[test]
fn test_habit_methods() -> Result<(), Box<dyn Error>> {
    let habit_tracker_service = mock_habit_tracker_service()?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::Daily,
        title: "some title".to_string(),
        question: "some question".to_string(),
    })?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::AppleCalendar,
        title: "some other title".to_string(),
        question: "some other question".to_string(),
    })?;
    habit_tracker_service.update_habit(UpdateHabitRequest {
        id: 1,
        habit_type: HabitType::AppleCalendar,
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
                title: "updated title".to_string(),
                question: "updated question".to_string(),
            },
            Habit {
                id: 2,
                habit_type: HabitType::AppleCalendar,
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
        title: "some title".to_string(),
        question: "some question".to_string(),
    })?;
    habit_tracker_service.create_habit(CreateHabitRequest {
        habit_type: HabitType::AppleCalendar,
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
