use serde::Deserialize;

use crate::HabitType;

#[derive(Debug, Deserialize)]
pub struct CreateHabitRequest {
    pub habit_type: HabitType,
    pub label: String,
    pub question_label: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateHabitRequest {
    pub habit_id: i64,
    pub habit_type: HabitType,
    pub label: String,
    pub question_label: String,
}

#[derive(Debug, Deserialize)]
pub struct InsertHabitEntryItem {
    pub habit_id: i64,
    pub completed: bool,
}

#[derive(Debug, Deserialize)]
pub struct InsertHabitEntriesRequest {
    pub data: Vec<InsertHabitEntryItem>,
}
