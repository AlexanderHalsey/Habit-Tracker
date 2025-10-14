(*
CALENDAR DEBUGGING TOOL
Purpose: Inspect full event properties to understand Calendar data structure
Use this when: 
  - You need to see all available event properties
  - Debugging why certain events aren't being found
  - Understanding recurrence rule formats
  - Identifying duplicate events and their properties
Returns: Complete event objects with all metadata for analysis
*)

tell application "Calendar"
	set calendarList to {}
	set eventList to {}
	
	-- Get all calendar properties
	repeat with aCalendar in calendars
		try
			set calendarInfo to {name:name of aCalendar}
			set end of calendarList to calendarInfo
		end try
	end repeat
	
	
	-- Get first 20 events
	repeat with aCalendar in calendars
		set calendarEvents to events of aCalendar
		
		if (count of calendarEvents) > 0 then
			set maxEvents to 20
			if (count of calendarEvents) < maxEvents then
				set maxEvents to count of calendarEvents
			end if
			
			repeat with i from 1 to maxEvents
				set anEvent to event i of aCalendar
				set eventProps to properties of anEvent
				set end of eventList to eventProps
			end repeat
			exit repeat
		end if
	end repeat
	
	return {calendarList:calendarList, eventList:eventList}
end tell
