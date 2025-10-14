// Habit Tracker Data Cleanup Binary
// Cross-platform utility to remove application data using the dirs crate
// Usage: cargo run --bin cleanup-data

use std::fs;
use std::io::{self, Write};
use std::path::PathBuf;

fn get_data_directory() -> Result<PathBuf, String> {
    let mut path = dirs::data_dir().ok_or("Could not determine data directory")?;
    path.push("HabitTracker");
    Ok(path)
}

fn prompt_user(message: &str) -> bool {
    print!("{message}");
    io::stdout().flush().unwrap();

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();

    matches!(input.trim().to_lowercase().as_str(), "y" | "yes")
}

fn main() {
    println!("🧹 Habit Tracker Data Cleanup");
    println!("=============================");
    println!();

    // Get the data directory path
    let data_dir = match get_data_directory() {
        Ok(path) => path,
        Err(e) => {
            eprintln!("Error: {e}");
            std::process::exit(1);
        }
    };

    println!("Data directory: {}", data_dir.display());
    println!();

    // Check if directory exists
    if !data_dir.exists() {
        println!("Data directory doesn't exist - nothing to clean up!");
        return;
    }

    // Show what will be removed
    println!("This will permanently remove:");
    println!("• All habit tracking data");
    println!("• Database files");
    println!("• Configuration files");
    println!("• Any cached data");
    println!();
    println!("⚠️  This action cannot be undone!");
    println!();

    // Confirm with user
    if !prompt_user("Are you sure you want to delete all habit tracker data? (y/N): ") {
        println!("Cleanup cancelled");
        return;
    }

    // Perform the cleanup
    match fs::remove_dir_all(&data_dir) {
        Ok(()) => {
            println!("Successfully removed all habit tracker data");
            println!("Removed: {}", data_dir.display());
        }
        Err(e) => {
            eprintln!("Failed to remove data directory: {e}");
            eprintln!("You may need to remove it manually: {}", data_dir.display());
            std::process::exit(1);
        }
    }

    println!();
    println!("Data cleanup complete!");
}
