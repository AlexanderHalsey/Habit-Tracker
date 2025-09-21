use config::{Config, ConfigError};

pub struct AppConfig {
    pub db_path: String,
}

pub fn get_app_config(env: &str) -> Result<AppConfig, ConfigError> {
    let db_path = if env == "test" {
        ":memory:".to_string()
    } else {
        Config::builder()
            .add_source(config::File::with_name("config"))
            .build()?
            .get_string(&format!("{env}.db_path"))?
    };
    Ok(AppConfig { db_path })
}
