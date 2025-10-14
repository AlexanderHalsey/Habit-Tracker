use std::error::Error;

pub struct AppConfig {
    pub db_path: String,
}

pub fn get_app_config() -> Result<AppConfig, Box<dyn Error>> {
    let db_path = if let Ok(custom_path) = std::env::var("HABIT_TRACKER_DB_PATH") {
        custom_path
    } else if cfg!(debug_assertions) {
        // Development
        "habits.db".to_string()
    } else {
        // Production: use platform-appropriate app data directory
        let mut path = dirs::data_dir().ok_or("Could not determine data directory")?;
        path.push("HabitTracker");
        // Create directory if it doesn't exist
        std::fs::create_dir_all(&path)?;
        path.push("habits.db");
        let path_str = path.to_string_lossy().to_string();
        path_str
    };
    Ok(AppConfig { db_path })
}

pub fn get_test_app_config() -> Result<AppConfig, Box<dyn Error>> {
    Ok(AppConfig {
        db_path: ":memory:".to_string(),
    })
}
