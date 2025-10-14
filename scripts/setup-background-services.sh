#!/bin/bash

# Setup script for Habit Tracker background services for macOS 
# This generates LaunchAgent plists with current system paths and configurable times
# See README.md for usage examples

# Default times
SYNC_HOUR=14      # 2 PM
NOTIFY_HOUR=20    # 8 PM

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --sync-hour)
            SYNC_HOUR="$2"
            shift 2
            ;;
        --notify-hour)
            NOTIFY_HOUR="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--sync-hour HOUR] [--notify-hour HOUR]"
            echo "  --sync-hour    Hour for calendar sync (0-23, default: 14 = 2 PM)"
            echo "  --notify-hour  Hour for notifications (0-23, default: 20 = 8 PM)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_HOME="$HOME"
LAUNCH_AGENTS_DIR="$USER_HOME/Library/LaunchAgents"

echo "Setting up Habit Tracker background services..."
echo "Project directory: $PROJECT_DIR"
echo "Calendar sync time: ${SYNC_HOUR}:00 ($(date -j -f "%H" "${SYNC_HOUR}" "+%I %p" 2>/dev/null || echo "${SYNC_HOUR}:00"))"
echo "Notification time: ${NOTIFY_HOUR}:00 ($(date -j -f "%H" "${NOTIFY_HOUR}" "+%I %p" 2>/dev/null || echo "${NOTIFY_HOUR}:00"))"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$LAUNCH_AGENTS_DIR"

# Generate notification plist with current paths
cat > "$LAUNCH_AGENTS_DIR/com.habittracker.notify.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.habittracker.notify</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>osascript</string>
        <string>$PROJECT_DIR/scripts/notify.applescript</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>$NOTIFY_HOUR</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    
    <key>RunAtLoad</key>
    <false/>
    
    <key>StandardOutPath</key>
    <string>/tmp/habittracker.notify.log</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/habittracker.notify.err</string>
</dict>
</plist>
EOF

# Generate sync plist with current paths
cat > "$LAUNCH_AGENTS_DIR/com.habittracker.sync.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.habittracker.sync</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/src-tauri/target/release/habit-sync</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>$SYNC_HOUR</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    
    <key>RunAtLoad</key>
    <false/>
    
    <key>StandardOutPath</key>
    <string>/tmp/habittracker.sync.log</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/habittracker.sync.err</string>
</dict>
</plist>
EOF

# Load and enable the services
echo "Loading services..."
launchctl load "$LAUNCH_AGENTS_DIR/com.habittracker.notify.plist"
launchctl load "$LAUNCH_AGENTS_DIR/com.habittracker.sync.plist"

echo "Enabling services for automatic startup..."
launchctl enable "gui/$(id -u)/com.habittracker.notify"
launchctl enable "gui/$(id -u)/com.habittracker.sync"

echo "✅ Background services setup successfully!"
echo "📱 Notifications will appear daily at ${NOTIFY_HOUR}:00"
echo "🔄 Calendar sync will run daily at ${SYNC_HOUR}:00"
echo ""
echo "To uninstall:"
echo "  launchctl unload $LAUNCH_AGENTS_DIR/com.habittracker.*.plist"
echo "  rm $LAUNCH_AGENTS_DIR/com.habittracker.*.plist"
