#!/bin/bash

# Habit Tracker Background Services Cleanup Script
# Removes background services and logs (undoes setup-background-services.sh)

set -e

echo "🧹 Habit Tracker Background Services Cleanup"
echo "============================================="
echo "This script removes macOS-specific background services and logs."
echo

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "This script is only for macOS systems"
    exit 1
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "Error: Do not run this script as root/sudo"
   exit 1
fi

# Function to unload and remove LaunchAgent
remove_launch_agent() {
    local plist_name="$1"
    local plist_path="$HOME/Library/LaunchAgents/$plist_name"
    
    if [ -f "$plist_path" ]; then
        echo "Stopping background service: $plist_name"
        launchctl unload "$plist_path" 2>/dev/null || true
        launchctl remove "${plist_name%.*}" 2>/dev/null || true
        rm "$plist_path"
        echo "Removed background service: $plist_name"
    else
        echo "ℹBackground service not found: $plist_name"
    fi
}

# Function to safely remove file if it exists
safe_remove_file() {
    local path="$1"
    local description="$2"
    
    if [ -f "$path" ]; then
        rm "$path"
        echo "Removed: $description"
    else
        echo "ℹNot found: $description (already clean)"
    fi
}

echo "This will remove:"
echo "• Background sync and notification services"
echo "• Apple Calendar integration logs"
echo
read -p "Continue with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

echo
echo "🚀 Starting macOS services cleanup..."
echo

# Remove background services
echo "Removing background services..."
remove_launch_agent "com.habittracker.sync.plist"
remove_launch_agent "com.habittracker.notify.plist"

# Remove logs
echo
echo "Removing logs..."
safe_remove_file "/tmp/habittracker.sync.log" "sync logs"
safe_remove_file "/tmp/habittracker.notify.log" "notification logs"

echo
echo "macOS services cleanup complete!"
