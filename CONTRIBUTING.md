
# New module integration:
 * To create a new module, simply create a new xyz.js file in the modules subdirectory
 * we have a common handler for discord command input: /helper/arguments.js Check this file, most of the things you might be interested in might already be covered there. You can pass an options object to your module, where you can refer to those things.
 * we have a standard output handler as well: check /helper/messages.js
 * Please do not change the foxbot.js itself for your commits for pull requests. Instead insert calls to your modules only in foxbot-dev.js, I will review them then in our Development Discord Server.
 
