use config::{Config, ConfigError};
use std::error::Error;

use crate::api::HabitTrackerService;

pub mod api;

fn main() -> Result<(), Box<dyn Error>> {
    let habit_tracker_service = HabitTrackerService::build()?;
    Ok(())
}

pub struct Environment {
    db_path: String,
}

fn get_environment() -> Result<Environment, ConfigError> {
    let env = std::env::var("APP_ENV").unwrap_or("dev".into());
    let db_path = Config::builder()
        .add_source(config::File::with_name("config"))
        .build()?
        .get_string(&format!("{env}.db_path"))?;
    Ok(Environment { db_path })
}
