pub mod api;
pub mod app_config;

pub use api::{
    CreateHabitRequest, Habit, HabitTrackerService, HabitType, InsertHabitEntriesRequest,
    InsertHabitEntryItem, UpdateHabitRequest,
};
pub use app_config::{get_app_config, AppConfig};
use std::error::Error;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn Error>> {
    let env = std::env::var("APP_ENV").unwrap_or("dev".into());
    let app_config = get_app_config(&env)?;
    let habit_tracker_service = HabitTrackerService::build(app_config);
    println!("Habit entries: {habit_tracker_service:#?}");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
