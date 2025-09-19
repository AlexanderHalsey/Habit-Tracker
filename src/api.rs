use chrono::{DateTime, Utc};
use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use rusqlite::{Connection, Result, Row, params};
use std::error::Error;

use crate::get_environment;

#[derive(Debug)]
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

#[derive(Debug)]
pub struct Habit {
    id: i64,
    habit_type: HabitType,
    label: String,
    question_label: String,
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

#[derive(Debug)]
pub struct HabitEntry {
    id: i64,
    habit_id: String,
    completed: bool,
    date: DateTime<Utc>,
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
    habit_type: HabitType,
    label: String,
    question_label: String,
}

#[derive(Debug)]
pub struct UpdateHabitRequest {
    habit_id: String,
    habit_type: HabitType,
    label: String,
    question_label: String,
}

#[derive(Debug)]
pub struct UpsertHabitEntryItem {
    habit_id: String,
    completed: bool,
}

#[derive(Debug)]
pub struct UpsertHabitEntriesRequest {
    data: Vec<UpsertHabitEntryItem>,
}

#[derive(Debug)]
pub struct HabitTrackerService {
    db_connection: Connection,
}

impl HabitTrackerService {
    pub fn build() -> Result<HabitTrackerService, Box<dyn Error>> {
        let environment = get_environment()?;
        let mut db_connection = Connection::open(environment.db_path)?;

        let transaction = db_connection.transaction()?;
        transaction.execute(
            "CREATE TABLE IF NOT EXISTS habit (
            id INTEGER PRIMARY KEY,
            habitType TEXT CHECK( type IN('daily', 'appleCalendar')) NOT NULL DEFAULT 'daily',
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

    pub fn insert_habit_entries(&mut self, request: UpsertHabitEntriesRequest) -> Result<()> {
        let transaction = self.db_connection.transaction()?;
        {
            let mut statement =
                transaction.prepare("INSERT INTO habitEntry (completed, habitId) VALUES (?, ?)")?;
            for UpsertHabitEntryItem {
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
