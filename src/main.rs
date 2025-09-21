use std::error::Error;

use habit_tracker::{HabitTrackerService, app_config::get_app_config};

fn main() -> Result<(), Box<dyn Error>> {
    let env = std::env::var("APP_ENV").unwrap_or("dev".into());
    let app_config = get_app_config(&env)?;
    let habit_tracker_service = HabitTrackerService::build(app_config);
    println!("Habit entries: {habit_tracker_service:#?}");
    Ok(())
}
