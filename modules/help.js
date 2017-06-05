// const vendor = require('../modules/vendor.sql.js'); // v2 ready
// const status = require('../modules/server.js');
// const getset = require('../modules/sets.db.js');
// const getsetstats = require('../modules/setstats.js');
// const pledges = require('../modules/pledges.js');
// const trials = require('../modules/trials.js');
// const log = require('../modules/log.js');
// const gettwitch = require('../modules/twitch.js'); // v2 ready
// const contact = require('../modules/contact.js');
// const youtube = require('../modules/youtube.js');
// const patchnotes = require('../modules/patchnotes.js');
// const patchpts = require('../modules/patchnotes-pts.js');
// const lfg = require('../modules/lfg.js');
// const lfm = require('../modules/lfm.js');
// const lb = require('../modules/leaderboards.js');
// const poll = require('../modules/vote.db.js');
// const esoDBhook = require('../modules/esoDBhook.js');
// const subscribe = require('../modules/subscribe.js');
// const ttc = require('../modules/ttc.js');
// const configure = require('../modules/settings.js');

const mh = require("../helper/messages.js")

var help = {
	'Regular Events':{
							 "!pledges": "Today's Undaunted pledges",
							 "!trials":"This weeks's special trials"	
							},
							
	'Weekend Vendors':	{
							 "!golden":"Cyrodiil Golden Vendor Items",
							 "!luxury":"Luxury Housing Vendor Items"	
							},
														

	'Official Information':{	
							 "!status":"ESO server status",
							 "!patch":"Latest ESO patch notes",	
							 "!patchpts":"PTS (Morrowind) patch notes"	
							},

	'Game Information':{	
							 "!set":"Set item information (e.g. !set skel)",
							 "!lb":"Leaderboard scores (e.g. !lb $account, EU, HRC)"	
							},

	'Group Tools':{	
							 "!poll":"Start a poll, vote and end it",
							},

	'Media':	{
							 "!youtube":"Hot, new and recommended ESO videos",
							 "!twitch":"Current top 5 ESO streams"	
							},

	'Bot':	{
							 "!contact":"Contact information for the Bot author",
//							 "!subscribe":"Automatic messages on events"
							 "!help":"This help page"	
							}							
}

module.exports = (bot, msg, options, Discord) => {
	var helptext = mh.prepare(Discord);

	if (options.options[0]=="-full"){
	for (var helpGrp in help){
		var helptxt = ""
		for (var helpCommand in help[helpGrp]){
		 	helptxt += "**"+helpCommand+"**: "+ help[helpGrp][helpCommand]+"\n"
		}
		helptext.addField(helpGrp,helptxt)
	}
	}else{
		var helptxt = ""
		for (var helpGrp in help){
			helptxt += "**"+helpGrp+"**: " +  Object.keys(help[helpGrp]).join(", ")	+ "\n"
		}		
		helptext.addField("Available commands: ", helptxt)		
		helptext.addField("Do you need more details: ", "**!help -full**: more details about all commands\n**!golden -help**: more details about the specific commands (in this case !golden)")				

	}
	
																												
	mh.send(msg, helptext)
	
};