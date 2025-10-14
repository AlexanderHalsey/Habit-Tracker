use crate::{
    AppConfig, CreateHabitRequest, InsertHabitEntriesRequest, InsertHabitEntryItem,
    UpdateHabitRequest,
};
#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
use chrono::serde::ts_seconds;
use chrono::{DateTime, Utc};
use rusqlite::{
    params,
    types::{FromSql, FromSqlError, FromSqlResult, ToSqlOutput, ValueRef},
    Connection, Error, Result, Row, ToSql,
};
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, PartialEq, Deserialize, Serialize, Type)]
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

#[derive(Debug, PartialEq, Deserialize, Serialize, Type)]
pub struct EventIds {
    pub values: Vec<String>,
}

impl FromSql for EventIds {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        let json_str = value.as_str_or_null()?;
        let values: Vec<String> = match json_str {
            Some(v) => serde_json::from_str(v).map_err(|_| FromSqlError::InvalidType)?,
            None => vec![],
        };
        Ok(EventIds { values })
    }
}

impl ToSql for EventIds {
    fn to_sql(&self) -> Result<ToSqlOutput<'_>> {
        let json = serde_json::to_string(&self.values)
            .map_err(|e| Error::ToSqlConversionFailure(Box::new(e)))?;
        Ok(ToSqlOutput::from(json))
    }
}

#[derive(Debug, PartialEq, Serialize, Type)]
pub struct Habit {
    pub id: i64,
    pub habit_type: HabitType,
    pub event_ids: EventIds,
    pub title: String,
    pub question: String,
}

impl Habit {
    pub fn from_row(row: &Row) -> Result<Self> {
        Ok(Habit {
            id: row.get("id")?,
            habit_type: row.get("habitType")?,
            event_ids: row.get("eventIds")?,
            title: row.get("title")?,
            question: row.get("question")?,
        })
    }
}

#[derive(Debug, PartialEq, Serialize, Type)]
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

#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
#[derive(Debug, PartialEq, Deserialize, Serialize, Type)]
pub struct AppleCalendarEvent {
    pub id: String,
    pub name: String,
    #[serde(deserialize_with = "ts_seconds::deserialize")]
    pub start_date: DateTime<Utc>,
    pub recurrence: String,
}

#[cfg(all(target_os = "macos", feature = "apple_calendar"))]
impl AppleCalendarEvent {
    pub fn from_row(row: &Row) -> Result<Self> {
        Ok(AppleCalendarEvent {
            id: row.get("id")?,
            name: row.get("name")?,
            start_date: row.get("startDate")?,
            recurrence: row.get("recurrence")?,
        })
    }
}

#[derive(Debug)]
pub struct HabitTrackerService {
    conn: Connection,
}

impl HabitTrackerService {
    pub fn build(app_config: AppConfig) -> Result<HabitTrackerService> {
        let mut conn = Connection::open(app_config.db_path)?;

        let transaction = conn.transaction()?;
        transaction.execute(
            "CREATE TABLE IF NOT EXISTS habit (
            id INTEGER PRIMARY KEY,
            habitType TEXT CHECK(habitType IN('daily', 'appleCalendar')) NOT NULL DEFAULT 'daily',
            eventIds TEXT NULL,
            title TEXT NOT NULL,
            question TEXT NOT NULL
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
        #[cfg(all(target_os = "macos", feature = "apple_calendar"))]
        transaction.execute(
            "CREATE TABLE IF NOT EXISTS appleCalendarEvent (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            startDate REAL NOT NULL,
            endDate REAL NULL,
            recurrence TEXT NOT NULL
        )",
            (),
        )?;
        transaction.commit()?;

        Ok(HabitTrackerService { conn })
    }

    pub fn create_habit(&self, request: CreateHabitRequest) -> Result<Habit> {
        self.conn.execute(
            "INSERT INTO habit (habitType, eventIds, title, question) VALUES (?1, ?2, ?3, ?4)",
            params![
                request.habit_type,
                request.event_ids,
                request.title,
                request.question
            ],
        )?;
        let id = self.conn.last_insert_rowid();
        self.conn.query_row(
            "SELECT * FROM habit WHERE id = ?1",
            params![id],
            Habit::from_row,
        )
    }

    pub fn get_habit_entries(&self) -> Result<Vec<HabitEntry>> {
        let mut statement = self.conn.prepare("SELECT * FROM habitEntry")?;
        let habit_entry_iter = statement.query_map([], HabitEntry::from_row)?;
        habit_entry_iter.collect::<Result<Vec<_>>>()
    }

    pub fn get_habits(&self) -> Result<Vec<Habit>> {
        let mut statement = self.conn.prepare("SELECT * FROM habit")?;
        let habit_iter = statement.query_map([], Habit::from_row)?;
        habit_iter.collect::<Result<Vec<_>>>()
    }

    pub fn update_habit(&self, request: UpdateHabitRequest) -> Result<Habit> {
        self.conn.execute(
            "UPDATE habit SET habitType = ?1, eventIds = ?2, title = ?3, question = ?4 WHERE id = ?5",
            params![
                request.habit_type,
                request.event_ids,
                request.title,
                request.question,
                request.id
            ],
        )?;
        self.conn.query_row(
            "SELECT * FROM habit WHERE id = ?1",
            params![request.id],
            Habit::from_row,
        )
    }

    pub fn insert_habit_entries(
        &mut self,
        request: InsertHabitEntriesRequest,
    ) -> Result<Vec<HabitEntry>> {
        let transaction = self.conn.transaction()?;
        {
            let mut statement = transaction
                .prepare("INSERT INTO habitEntry (completed, habitId) VALUES (?1, ?2)")?;
            for InsertHabitEntryItem {
                completed,
                habit_id,
            } in &request.data
            {
                statement.execute(params![completed, habit_id])?;
            }
        }
        transaction.commit()?;
        let mut statement = self.conn.prepare(
            "SELECT * FROM (SELECT * FROM habitEntry ORDER BY id DESC LIMIT ?1) ORDER BY id ASC",
        )?;
        let habit_entry_iter =
            statement.query_map(params![request.data.len()], HabitEntry::from_row)?;
        habit_entry_iter.collect::<Result<Vec<_>>>()
    }

    #[cfg(all(target_os = "macos", feature = "apple_calendar"))]
    pub fn get_apple_calendar_events(&self) -> Result<Vec<AppleCalendarEvent>> {
        let mut statement = self.conn.prepare("SELECT * FROM appleCalendarEvent")?;
        let apple_calendar_event_iter = statement.query_map([], AppleCalendarEvent::from_row)?;
        apple_calendar_event_iter.collect::<Result<Vec<_>>>()
    }

    #[cfg(all(target_os = "macos", feature = "apple_calendar"))]
    pub fn reset_apple_calendar_events(
        &mut self,
        request: Vec<AppleCalendarEvent>,
    ) -> Result<Vec<AppleCalendarEvent>> {
        let transaction = self.conn.transaction()?;
        // squash and replace all events
        transaction.execute("DELETE FROM appleCalendarEvent", [])?;
        {
            let mut statement = transaction.prepare(
                "INSERT INTO appleCalendarEvent (id, name, startDate, recurrence) VALUES (?1, ?2, ?3, ?4)",
            )?;
            for AppleCalendarEvent {
                id,
                name,
                start_date,
                recurrence,
            } in &request
            {
                statement.execute(params![id, name, start_date, recurrence])?;
            }
        }
        transaction.commit()?;
        let mut statement = self.conn.prepare("SELECT * FROM appleCalendarEvent")?;
        let apple_calendar_events_iter = statement.query_map([], AppleCalendarEvent::from_row)?;
        apple_calendar_events_iter.collect::<Result<Vec<_>>>()
    }
}

#[cfg(test)]
pub mod unit_tests {
    use crate::api::{
        AppleCalendarEvent, EventIds, Habit, HabitEntry, HabitTrackerService, HabitType,
    };
    use crate::get_test_app_config;
    use chrono::Utc;
    use rusqlite::types::{FromSql, FromSqlError, ToSqlOutput, Value, ValueRef};
    use rusqlite::{params, Connection, Result, ToSql};
    use std::error::Error;

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

    #[test]
    fn test_event_ids() -> Result<()> {
        // column result method
        assert_eq!(
            EventIds::column_result("[\"1\", \"2\", \"3\"]".into())?,
            EventIds {
                values: vec!["1".to_owned(), "2".to_owned(), "3".to_owned()]
            }
        );
        assert_eq!(
            EventIds::column_result("invalid json".into()).unwrap_err(),
            FromSqlError::InvalidType
        );
        // to sql method
        let event_ids = EventIds {
            values: Vec::from(["1".to_owned(), "2".to_owned()]),
        };
        let sql_output = event_ids.to_sql()?;
        match sql_output {
            ToSqlOutput::Owned(Value::Text(text)) => {
                assert_eq!(text, "[\"1\",\"2\"]")
            }
            ToSqlOutput::Borrowed(ValueRef::Text(bytes)) => {
                let text = std::str::from_utf8(bytes)?;
                assert_eq!(text, "[\"1\",\"2\"]");
            }
            _ => panic!("Expected text output"),
        };
        Ok(())
    }

    fn create_habit(db_connection: &Connection) -> Result<Habit> {
        let fixture = Habit {
            id: 1,
            habit_type: HabitType::AppleCalendar,
            event_ids: EventIds {
                values: vec!["event_id".into()],
            },
            title: "some title".into(),
            question: "some question".into(),
        };
        db_connection.execute(
            "INSERT INTO habit (habitType, eventIds, title, question) VALUES (?1, ?2, ?3, ?4)",
            params![
                fixture.habit_type,
                fixture.event_ids,
                fixture.title,
                fixture.question,
            ],
        )?;
        Ok(fixture)
    }

    #[test]
    fn test_habit_from_row() -> Result<(), Box<dyn Error>> {
        let app_config = get_test_app_config()?;
        let db_connection = HabitTrackerService::build(app_config)?.conn;
        let fixture = create_habit(&db_connection)?;
        let mut statement = db_connection.prepare("SELECT * FROM habit")?;
        let queried_habit = statement.query_map([], Habit::from_row)?.next().unwrap()?;

        assert_eq!(queried_habit, fixture);
        Ok(())
    }

    #[test]
    fn test_habit_entry_from_row() -> Result<(), Box<dyn Error>> {
        let habit_entry_fixture = HabitEntry {
            id: 1,
            habit_id: 1,
            completed: true,
            date: Utc::now(),
        };
        let app_config = get_test_app_config()?;
        let db_connection = HabitTrackerService::build(app_config)?.conn;
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

    #[test]
    fn test_apple_calendar_event_from_row() -> Result<(), Box<dyn Error>> {
        let app_config = get_test_app_config()?;
        let db_connection = HabitTrackerService::build(app_config)?.conn;
        let fixture = AppleCalendarEvent {
            id: "appleCalendarEventId".into(),
            name: "calendarEventName".into(),
            start_date: Utc::now(),
            recurrence: "recurrence".into(),
        };
        db_connection.execute(
            "INSERT INTO appleCalendarEvent (id, name, startDate, recurrence) VALUES (?1, ?2, ?3, ?4)",
            params![fixture.id, fixture.name, fixture.start_date, fixture.recurrence],
        )?;
        let mut statement = db_connection.prepare("SELECT * FROM appleCalendarEvent")?;
        let queried_apple_calendar_event = statement
            .query_map([], AppleCalendarEvent::from_row)?
            .next()
            .unwrap()?;

        assert_eq!(queried_apple_calendar_event, fixture);
        Ok(())
    }
}
