use crate::api::connect_db::connect_db;
use config::{Config, ConfigError};

pub mod api;

fn main() {
    let settings = get_settings().expect("Error getting settings");
    let db_connection = connect_db(settings);
    println!("Hello, world! {db_connection:#?}");
}

pub struct Settings {
    db_path: String,
}

fn get_settings() -> Result<Settings, ConfigError> {
    let env = std::env::var("APP_ENV").unwrap_or("dev".into());
    let settings = Config::builder()
        .add_source(config::File::with_name("config"))
        .build()?
        .get_table(&env)?;
    if let Some(v) = settings.get("db_path") {
        Ok(Settings {
            db_path: v.to_string(),
        })
    } else {
        Err(ConfigError::Message("Incorrect Settings".to_string()))
    }
}
