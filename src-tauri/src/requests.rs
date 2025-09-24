use crate::HabitType;
use serde::Deserialize;
use specta::Type;

#[derive(Debug, Deserialize, Type)]
pub struct CreateHabitRequest {
    pub habit_type: HabitType,
    pub title: String,
    pub question: String,
}

#[derive(Debug, Deserialize, Type)]
pub struct UpdateHabitRequest {
    pub id: i64,
    pub habit_type: HabitType,
    pub title: String,
    pub question: String,
}

#[derive(Debug, Deserialize, Type)]
pub struct InsertHabitEntryItem {
    pub habit_id: i64,
    pub completed: bool,
}

#[derive(Debug, Deserialize, Type)]
pub struct InsertHabitEntriesRequest {
    pub data: Vec<InsertHabitEntryItem>,
}
