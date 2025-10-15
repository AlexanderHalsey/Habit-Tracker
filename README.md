# Habit Tracker

A habit tracking application that helps you build and maintain daily routines. Built with Tauri (Rust + React).

## What it does

- Track daily habits with simple yes/no completion
- View your progress on a calendar
- Optionally sync with macOS Calendar for advanced recurrence patterns

## Getting Started

### Prerequisites

- Node.js and npm
- Rust and Cargo

### Installation

```bash
git clone <your-repo-url>
cd habit_tracker
npm install
```

### Running the App

```bash
# Development (includes Apple Calendar features by default)
npm run dev

# Frontend-only development (faster iteration)
npm run dev:frontend
```

### Building for Distribution

```bash
# Full-featured release (with Apple Calendar integration)
npm run build:release

# Basic release (habit tracking only, cross-platform)
npm run build:release-basic
```

## Database Storage

The app automatically stores your data in the standard location for your operating system, following platform conventions via the [dirs](https://crates.io/crates/dirs) crate:

- **macOS**: `~/Library/Application Support/HabitTracker/habits.db`
- **Windows**: `%APPDATA%/HabitTracker/habits.db`
- **Linux**: `~/.local/share/HabitTracker/habits.db`

This ensures your data is stored where users expect to find application data on each platform, and integrates properly with system backup and sync tools.

### Advanced: Custom Database Location

For advanced users who want to customize the database location (e.g., for network storage, backup workflows, or multiple app versions):

```bash
# Set custom location via environment variable
export HABIT_TRACKER_DB_PATH="/path/to/your/custom/habits.db"
```

**Note**: In development mode (`npm run dev`), the app defaults to `habits.db` in the project directory for convenience.

## Apple Calendar Integration (macOS)

This optional feature syncs recurring calendar events to enable advanced scheduling for habits beyond simple daily tracking.

### How it works

Calendar sync updates your app's event database from Apple Calendar, allowing habits to follow complex recurrence patterns (weekly, monthly, etc.) instead of just daily repetition. Habits can be linked to these calendar events for automatic scheduling based on your calendar's recurrence rules.

**Two ways to sync calendar events:**

- **In-app**: Use the manual sync button in the habit form when you need fresh calendar data immediately
- **Background**: Automated daily sync keeps your event database up-to-date with any calendar changes

**Typical workflow:** Change calendar events in the morning → background calendar sync runs in afternoon → when tracking habits in the evening, you'll be warned if any habits are linked to outdated events and need to re-link them to updated events.

### Manual Sync Commands

```bash
# Quick test of sync functionality
npm run sync:test

# Build the sync binary
npm run sync:build

# Run pre-built sync binary
npm run sync:run
```

## Background Services (macOS)

Two automated services enhance the experience:

### 1. Calendar Sync Service

- **Purpose**: Keeps Apple Calendar events synchronized daily
- **Schedule**: 2 PM daily (configurable)

### 2. Habit Reminder Notifications

- **Purpose**: Daily reminders to track your habits
- **Schedule**: 8 PM daily (configurable)

### Setup & Management

**Setup with configurable times:**

Available arguments: `--sync-hour` (0-23), `--notify-hour` (0-23)

```bash
# Default times (2 PM sync, 8 PM notifications)
./scripts/setup-background-services.sh

# Custom times example
./scripts/setup-background-services.sh --sync-hour 9 --notify-hour 21
```

**Manual management:**

```bash
# Check services are running
launchctl list | grep habittracker

# Disable all services
launchctl unload ~/Library/LaunchAgents/com.habittracker.*.plist
rm ~/Library/LaunchAgents/com.habittracker.*.plist
```

## Cleanup

### Background Services (macOS only)

To remove background services and logs (undoes `setup-background-services.sh`):

```bash
# Clean up background services and logs
./scripts/cleanup-background-services.sh
```

### App Data (Cross-platform)

To remove all app data:

```bash
# Remove app data (assuming release build exists)
src-tauri/target/release/cleanup-data

# Alternative: using cargo (requires Rust toolchain)
cd src-tauri && cargo run --bin cleanup-data
```

This will delete all app data from the platform-appropriate location:

- **macOS**: `~/Library/Application Support/HabitTracker/`
- **Windows**: `%APPDATA%\HabitTracker\`
- **Linux**: `~/.local/share/HabitTracker/`

**Note**: App data removal is irreversible. Backup your data if you want to keep it.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `cd src-tauri && cargo test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
