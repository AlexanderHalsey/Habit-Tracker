use crate::Settings;
use rusqlite::{Connection, Result};

pub fn connect_db(settings: Settings) -> Result<()> {
    let connection = Connection::open(settings.db_path)?;
    Ok(())
}
