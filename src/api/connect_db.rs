use crate::Settings;
use rusqlite::{Connection, Result};

pub fn connect_db(settings: Settings) -> Result<Connection> {
    let mut connection = Connection::open(settings.db_path)?;
    let transaction = connection.transaction()?;
    transaction.execute(
        "CREATE TABLE IF NOT EXISTS habit (
            id INTEGER PRIMARY KEY,
            type TEXT CHECK( type IN('daily', 'appleCalendar')) NOT NULL DEFAULT 'daily',
            label TEXT NOT NULL,
            questionLabel TEXT NOT NULL
        )",
        (),
    )?;
    transaction.execute(
        "CREATE TABLE IF NOT EXISTS habitEntry (
            id INTEGER PRIMARY KEY,
            completed BOOLEAN NOT NULL CHECK(completed IN (0, 1)),
            date REAL NOT NULL,
            habitId INTEGER,
            FOREIGN KEY(habitId) REFERENCES habit(id)
        )",
        (),
    )?;
    let _ = transaction.commit();
    Ok(connection)
}
