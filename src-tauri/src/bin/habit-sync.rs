#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
use std::{error::Error, sync::Mutex};

#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
use habit_tracker_lib::{get_app_config, sync_apple_calendar_events_impl, HabitTrackerService};

#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
fn main() -> Result<(), Box<dyn Error>> {
    let rt = tokio::runtime::Runtime::new()?;
    rt.block_on(async_main())
}

#[cfg(not(all(target_os = "macos", feature = "apple_calendar")))]
fn main() {
    eprintln!("habit-sync binary requires 'apple_calendar' feature to be enabled");
    std::process::exit(1);
}

#[cfg(feature = "apple_calendar")]
async fn async_main() -> Result<(), Box<dyn Error>> {
    let app_config = get_app_config()?;
    let service = HabitTrackerService::build(app_config)?;

    match sync_apple_calendar_events_impl(&Mutex::new(service)).await {
        Ok(_) => {
            println!("Calendar sync completed successfully");
        }
        Err(e) => {
            eprintln!("Sync failed: {e}");
            std::process::exit(1);
        }
    }

    Ok(())
}
