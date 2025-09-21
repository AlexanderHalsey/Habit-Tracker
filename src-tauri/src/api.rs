use crate::AppConfig;
use chrono::{DateTime, Utc};
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use rusqlite::{Connection, Result, Row, params};
use std::error::Error;

#[derive(Debug, PartialEq)]
pub enum HabitType {
    Daily,
    AppleCalendar,
}

impl FromSql for HabitType {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        let s = value.as_str()?;
        match s {
            "daily" => Ok(HabitType::Daily),
            "appleCalendar" => Ok(HabitType::AppleCalendar),
            _ => Err(FromSqlError::InvalidType),
        }
    }
}

impl ToSql for HabitType {
    fn to_sql(&self) -> Result<ToSqlOutput<'_>> {
        let s = match self {
            HabitType::Daily => "daily",
            HabitType::AppleCalendar => "appleCalendar",
        };
        Ok(ToSqlOutput::from(s))
    }
}

#[derive(Debug, PartialEq)]
pub struct Habit {
    pub id: i64,
    pub habit_type: HabitType,
    pub label: String,
    pub question_label: String,
}

impl Habit {
    pub fn from_row(row: &Row) -> Result<Self> {
        Ok(Habit {
            id: row.get("id")?,
            habit_type: row.get("habitType")?,
            label: row.get("label")?,
            question_label: row.get("questionLabel")?,
        })
    }
}

#[derive(Debug, PartialEq)]
pub struct HabitEntry {
    pub id: i64,
    pub habit_id: i64,
    pub completed: bool,
    pub date: DateTime<Utc>,
}

impl HabitEntry {
    pub fn from_row(row: &Row) -> Result<Self> {
        Ok(HabitEntry {
            id: row.get("id")?,
            habit_id: row.get("habitId")?,
            completed: row.get("completed")?,
            date: row.get("date")?,
        })
    }
}

#[derive(Debug)]
pub struct CreateHabitRequest {
    pub habit_type: HabitType,
    pub label: String,
    pub question_label: String,
}

#[derive(Debug)]
pub struct UpdateHabitRequest {
    pub habit_id: i64,
    pub habit_type: HabitType,
    pub label: String,
    pub question_label: String,
}

#[derive(Debug)]
pub struct InsertHabitEntryItem {
    pub habit_id: i64,
    pub completed: bool,
}

#[derive(Debug)]
pub struct InsertHabitEntriesRequest {
    pub data: Vec<InsertHabitEntryItem>,
}

#[derive(Debug)]
pub struct HabitTrackerService {
    db_connection: Connection,
}

impl HabitTrackerService {
    pub fn build(app_config: AppConfig) -> Result<HabitTrackerService, Box<dyn Error>> {
        let mut db_connection = Connection::open(app_config.db_path)?;

        let transaction = db_connection.transaction()?;
        transaction.execute(
            "CREATE TABLE IF NOT EXISTS habit (
            id INTEGER PRIMARY KEY,
            habitType TEXT CHECK(habitType IN('daily', 'appleCalendar')) NOT NULL DEFAULT 'daily',
            label TEXT NOT NULL,
            questionLabel TEXT NOT NULL
        )",
            (),
        )?;
        transaction.execute(
            "CREATE TABLE IF NOT EXISTS habitEntry (
            id INTEGER PRIMARY KEY,
            completed BOOLEAN NOT NULL CHECK(completed IN (0, 1)),
            date REAL NOT NULL DEFAULT CURRENT_TIMESTAMP,
            habitId INTEGER,
            FOREIGN KEY(habitId) REFERENCES habit(id)
        )",
            (),
        )?;
        transaction.commit()?;

        Ok(HabitTrackerService { db_connection })
    }

    pub fn create_habit(&self, request: CreateHabitRequest) -> Result<usize> {
        self.db_connection.execute(
            "INSERT INTO habit (habitType, label, questionLabel) VALUES (?1, ?2, ?3)",
            params![request.habit_type, request.label, request.question_label],
        )
    }

    pub fn get_habit_entries(&self) -> Result<Vec<HabitEntry>> {
        let mut statement = self.db_connection.prepare("SELECT * FROM habitEntry")?;
        let habit_entry_iter = statement.query_map([], HabitEntry::from_row)?;
        habit_entry_iter.collect::<Result<Vec<_>>>()
    }

    pub fn get_habits(&self) -> Result<Vec<Habit>> {
        let mut statement = self.db_connection.prepare("SELECT * FROM habit")?;
        let habit_iter = statement.query_map([], Habit::from_row)?;
        habit_iter.collect::<Result<Vec<_>>>()
    }

    pub fn update_habit(&self, request: UpdateHabitRequest) -> Result<usize> {
        self.db_connection.execute(
            "UPDATE habit SET habitType = ?1, label = ?2, questionLabel = ?3 WHERE id = ?4",
            params![
                request.habit_type,
                request.label,
                request.question_label,
                request.habit_id
            ],
        )
    }

    pub fn insert_habit_entries(&mut self, request: InsertHabitEntriesRequest) -> Result<()> {
        let transaction = self.db_connection.transaction()?;
        {
            let mut statement = transaction
                .prepare("INSERT INTO habitEntry (completed, habitId) VALUES (?1, ?2)")?;
            for InsertHabitEntryItem {
                completed,
                habit_id,
            } in request.data
            {
                statement.execute(params![completed, habit_id])?;
            }
        }
        transaction.commit()
    }
}

#[cfg(test)]
pub mod unit_tests {
    use chrono::Utc;
    use rusqlite::types::{FromSql, FromSqlError, ToSqlOutput};
    use rusqlite::{Connection, Result, ToSql, params};

    use crate::api::{Habit, HabitEntry, HabitType};

    #[test]
    fn test_habit_types() -> Result<()> {
        // column_result method
        assert_eq!(HabitType::column_result("daily".into())?, HabitType::Daily);
        assert_eq!(
            HabitType::column_result("appleCalendar".into())?,
            HabitType::AppleCalendar
        );
        assert_eq!(
            HabitType::column_result("incorrect_type".into()).unwrap_err(),
            FromSqlError::InvalidType,
        );
        // to_sql method
        assert_eq!(HabitType::Daily.to_sql()?, ToSqlOutput::from("daily"));
        assert_eq!(
            HabitType::AppleCalendar.to_sql()?,
            ToSqlOutput::from("appleCalendar"),
        );
        Ok(())
    }

    pub fn in_memory_connection() -> Result<Connection> {
        let mut db_connection = Connection::open_in_memory()?;
        let transaction = db_connection.transaction()?;
        transaction.execute(
            "CREATE TABLE habit (
            id INTEGER PRIMARY KEY,
            habitType TEXT CHECK(habitType IN('daily', 'appleCalendar')) NOT NULL DEFAULT 'daily',
            label TEXT NOT NULL,
            questionLabel TEXT NOT NULL
        )",
            (),
        )?;
        transaction.execute(
            "CREATE TABLE habitEntry (
            id INTEGER PRIMARY KEY,
            completed BOOLEAN NOT NULL CHECK(completed IN (0, 1)),
            date REAL NOT NULL DEFAULT CURRENT_TIMESTAMP,
            habitId INTEGER,
            FOREIGN KEY(habitId) REFERENCES habit(id)
        )",
            (),
        )?;
        transaction.commit()?;
        Ok(db_connection)
    }

    fn create_habit(db_connection: &Connection) -> Result<Habit> {
        let fixture = Habit {
            id: 1,
            habit_type: HabitType::AppleCalendar,
            label: "some label".into(),
            question_label: "some question label".into(),
        };
        db_connection.execute(
            "INSERT INTO habit (habitType, label, questionLabel) VALUES (?1, ?2, ?3)",
            params![fixture.habit_type, fixture.label, fixture.question_label,],
        )?;
        Ok(fixture)
    }

    #[test]
    fn test_habit_from_row() -> Result<()> {
        let db_connection = in_memory_connection()?;
        let fixture = create_habit(&db_connection)?;
        db_connection.execute(
            "INSERT INTO habit (habitType, label, questionLabel) VALUES (?1, ?2, ?3)",
            params![fixture.habit_type, fixture.label, fixture.question_label,],
        )?;

        let mut statement = db_connection.prepare("SELECT * FROM habit")?;
        let queried_habit = statement.query_map([], Habit::from_row)?.next().unwrap()?;

        assert_eq!(queried_habit, fixture);
        Ok(())
    }

    #[test]
    fn test_habit_entry_from_row() -> Result<()> {
        let habit_entry_fixture = HabitEntry {
            id: 1,
            habit_id: 1,
            completed: true,
            date: Utc::now(),
        };

        let db_connection = in_memory_connection()?;
        // create habit to ensure a habit_id for entry
        create_habit(&db_connection)?;
        db_connection.execute(
            "INSERT INTO habitEntry (habitId, completed, date) VALUES (?1, ?2, ?3)",
            params![
                habit_entry_fixture.habit_id,
                habit_entry_fixture.completed,
                habit_entry_fixture.date,
            ],
        )?;

        let mut statement = db_connection.prepare("SELECT * FROM habitEntry")?;
        let queried_habit_entry = statement
            .query_map([], HabitEntry::from_row)?
            .next()
            .unwrap()?;

        assert_eq!(queried_habit_entry, habit_entry_fixture);
        Ok(())
    }
}
