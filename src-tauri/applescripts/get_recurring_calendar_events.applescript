(*
HABIT TRACKER CALENDAR INTEGRATION
Purpose: Fetch recurring Apple Calendar events for habit tracking
Why recurring events: Habits are repeating behaviors, so we link to recurring calendar events
Filter logic: 
  - Only events from specified calendars (targetCalendars, in my case just "Home") 
  - Remove duplicates by event ID (Calendar sometimes creates multiple instances)
Usage: Edit targetCalendars list to match your calendar names
*)

use framework "Foundation"
use scripting additions

tell application "Calendar"
	set recurringEvents to {}
	set seenIDs to {}
	set targetCalendars to {"Home"}
	set appleEpoch to date "Thursday, 1 January 1970 at 00:00:00"
	
	repeat with aCalendar in calendars
		if targetCalendars contains (name of aCalendar) then
			set allEvents to every event of aCalendar
			
			repeat with anEvent in allEvents
				try
					if recurrence of anEvent is not missing value then
						set eventID to uid of anEvent
						
						if seenIDs does not contain eventID then
							set eventProps to {|id|:eventID, |name|:summary of anEvent, start_date:(start date of anEvent) - appleEpoch, |recurrence|:recurrence of anEvent}
							set end of recurringEvents to eventProps
							set end of seenIDs to eventID
							
						end if
					end if
				end try
			end repeat
		end if
	end repeat
	
	-- Convert to JSON
	set jsonData to current application's NSJSONSerialization's dataWithJSONObject:recurringEvents options:1 |error|:(missing value)
	set jsonString to current application's NSString's alloc()'s initWithData:jsonData encoding:(current application's NSUTF8StringEncoding)
	return jsonString as text
end tell
