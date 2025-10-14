-- Habit Tracker Notification Script
-- See scripts/com.habittracker.notify.plist and README.md for setup instructions

try
	-- Get app path without launching it
	set appPath to ((path to applications folder as string) & "Habit Tracker.app")
	set iconPath to (appPath & ":Contents:Resources:icon.icns")
	
	set dialogResult to display dialog Â
		"Time to track your daily habits!" with title Â
		"Habit Tracker Reminder" with icon file iconPath Â
		buttons {"Later", "Open"} Â
		default button Â
		"Open" giving up after 300
	
	if button returned of dialogResult is "Open" then
		try
			tell application "Habit Tracker" to activate
		on error
			-- If app not found, fall back to VS Code
			tell application "Visual Studio Code"
				activate
			end tell
		end try
	end if
	
on error errMsg
	-- Log any errors for debugging
	do shell script "echo 'Notification error: " & errMsg & "' >> /tmp/habittracker.notify.log"
end try
