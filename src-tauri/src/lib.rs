pub mod api;
pub mod app_config;
pub mod requests;

#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
use crate::api::AppleCalendarEvent;
use crate::api::HabitEntry;
pub use api::{Habit, HabitTrackerService};
pub use app_config::{get_app_config, AppConfig};
pub use requests::{
    CreateHabitRequest, InsertHabitEntriesRequest, InsertHabitEntryItem, UpdateHabitRequest,
};
use specta::{
    export,
    ts::{BigIntExportBehavior, ExportConfiguration},
};
use std::{error::Error, sync::Mutex};
use tauri::State;
use tokio::process::Command;

#[tauri::command]
fn get_habits(state: State<Mutex<HabitTrackerService>>) -> Result<Vec<Habit>, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .get_habits()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_habit_entries(state: State<Mutex<HabitTrackerService>>) -> Result<Vec<HabitEntry>, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .get_habit_entries()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_habit(
    state: State<Mutex<HabitTrackerService>>,
    request: CreateHabitRequest,
) -> Result<Habit, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .create_habit(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_habit(
    state: State<Mutex<HabitTrackerService>>,
    request: UpdateHabitRequest,
) -> Result<Habit, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .update_habit(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn insert_habit_entries(
    state: State<Mutex<HabitTrackerService>>,
    request: InsertHabitEntriesRequest,
) -> Result<Vec<HabitEntry>, String> {
    let mut habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .insert_habit_entries(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_apple_calendar_feature_status() -> bool {
    cfg!(target_os = "macos") && cfg!(feature = "apple_calendar")
}

#[tauri::command]
#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
fn get_apple_calendar_events(
    state: State<Mutex<HabitTrackerService>>,
) -> Result<Vec<AppleCalendarEvent>, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .get_apple_calendar_events()
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
async fn sync_apple_calendar_events(
    state: State<'_, Mutex<HabitTrackerService>>,
) -> Result<Vec<AppleCalendarEvent>, String> {
    let output_utf8 = Command::new("osascript")
        .args(["./applescripts/get_recurring_calendar_events.applescript"])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let request = serde_json::from_slice::<Vec<AppleCalendarEvent>>(&output_utf8.stdout)
        .map_err(|e| e.to_string())?;
    let mut habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .reset_apple_calendar_events(request)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn Error>> {
    export::ts_with_cfg(
        "../src/api/dtos.ts",
        &ExportConfiguration::default().bigint(BigIntExportBehavior::Number),
    )
    .unwrap();

    let env = std::env::var("APP_ENV").unwrap_or("dev".into());
    let app_config = get_app_config(&env)?;
    let habit_tracker_service = HabitTrackerService::build(app_config)?;

    tauri::Builder::default()
        .manage(Mutex::new(habit_tracker_service))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_habits,
            get_habit_entries,
            create_habit,
            update_habit,
            insert_habit_entries,
            get_apple_calendar_feature_status,
            #[cfg(all(target_os = "macos", feature = "apple_calendar"))]
            get_apple_calendar_events,
            #[cfg(all(target_os = "macos", feature = "apple_calendar"))]
            sync_apple_calendar_events,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
