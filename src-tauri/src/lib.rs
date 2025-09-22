pub mod api;
pub mod app_config;
pub mod requests;

pub use api::{Habit, HabitTrackerService, HabitType};
pub use app_config::{get_app_config, AppConfig};
pub use requests::{
    CreateHabitRequest, InsertHabitEntriesRequest, InsertHabitEntryItem, UpdateHabitRequest,
};
use std::{error::Error, sync::Mutex};
use tauri::State;

use crate::api::HabitEntry;

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
) -> Result<usize, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .create_habit(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_habit(
    state: State<Mutex<HabitTrackerService>>,
    request: UpdateHabitRequest,
) -> Result<usize, String> {
    let habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .update_habit(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn insert_habit_entries(
    state: State<Mutex<HabitTrackerService>>,
    request: InsertHabitEntriesRequest,
) -> Result<bool, String> {
    let mut habit_tracker_service = state.lock().unwrap();
    habit_tracker_service
        .insert_habit_entries(request)
        .map_err(|e| e.to_string())?;
    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn Error>> {
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
            insert_habit_entries
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
