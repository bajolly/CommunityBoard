# update existing community board

## new look
- update stories page to a kanban format
- allow user to configure number of swimlanes and provide lane titles
- place the stories in lanes
- allow user to drag stories from one lane to another

## fix problems
- make phone number optional when signing up currently is phone number is blank their is a resgistation error.
- allow editors to move stories to new swimlanes.  Current issue is that currently editor can only drag stories to new swimlane in the same session they create them.  If the editor logs out and new back in they cannot select and drag stories to new swimlanes
- users should not be able to move stories between swimlanes.


## update UI to view and edit swimlane config
- create a UI that is accessed from the admin page that shows the UI config as a json object.
- only admin should be able to access this page.
- admin should be able to update the config by editing the admin.
- when the config is updated.
	- map the existing stories to updated swimlane by order.
	- if the new config does not have a swimlane matching the existing order then set the existing story to first swimlane.

## fix problems 2
- when adding or removing lanes by editing config when index.html is refreshed only 3 swim lanes are shown even if a new swimlane was added.
- editors can only get into drag mode after selecting "create story" if an editor logs in and doesn't create a new story they cannot drag stories to new lane.

## fix problems 3
- Given this board config 
'''
"_id":"6876b6613c3318dbf8cbf58f","lanes":[{"id":"0","title":"To Do","order":0,"_id":"6876b6613c3318dbf8cbf590"},{"id":"1","title":"In Progress","order":1,"_id":"6876b6613c3318dbf8cbf591"},{"id":"2","title":"Test","order":2,"_id":"6876b6613c3318dbf8cbf592"},{"id":"3","title":"Done","order":3,"_id":"6876b6613c3318dbf8cbf593"}],"createdBy":{"_id":"6871901dd780d889c3f47070","fullname":"System Administrator"},"updatedAt":"2025-07-15T20:25:08.322Z","__v":1}
'''
there is no content in the 
'''
<div class="kanban-lane">
   <div class="lane-header">Done</div>
   <div class="lane-content" date-lane-id="3"></div>
</div>

I see the html but nothing in the dispaly

## Deployment updates
- Add docker container to run the npm app
- Add logging to file update existing console logs to log to file instead
	- Update app to run in DEBUG and PROD modes
- Authenticate /api/board calls with JWT allow
	- GET requests should only require "user" permissions
   - PUT request should be edit or admin 
  
## Update Initial Page
- before showing board require users to sign in
- create a script for packaging the app and updating the docker container

   






















