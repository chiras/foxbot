// local modules
const vendor = require('../modules/vendor.sql.js'); // v2 ready
const status = require('../modules/server.js');
const getset = require('../modules/sets.db.js');
const getsetstats = require('../modules/setstats.js');
const help = require('../modules/help.js');
const pledges = require('../modules/pledges.js');
const trials = require('../modules/trials.js');
const log = require('../modules/log.js');
const gettwitch = require('../modules/twitch.js'); // v2 ready
const contact = require('../modules/contact.js');
const youtube = require('../modules/youtube.js');
const patchnotes = require('../modules/patchnotes.js');
const patchpts = require('../modules/patchnotes-pts.js');
const lfg = require('../modules/lfg.js');
const lfm = require('../modules/lfm.js');
const leaderboards = require('../modules/leaderboards.js');
const poll = require('../modules/vote.db.js');
const esoDBhook = require('../modules/esoDBhook.js');
const subscribe = require('../modules/subscribe.js');
const ttc = require('../modules/ttc.js');
const configure = require('../modules/settings.js');


exports.getResponse = function(bot, msg, options, mysql, tokens, Discord, callback){ // add required / optional?

	var responses = {
		//v2 ready
		"!golden" 	: function(){vendor(bot, msg, options, mysql, "golden", Discord);}, 
		"!luxury" 	: function(){vendor(bot, msg, options, mysql, "luxury", Discord);}, 
		"!twitch" 	: function(){gettwitch(bot, msg, tokens["twitch"], Discord);}, //no help yet
		"!youtube" 	: function(){youtube(bot, msg, tokens["youtube"], options, mysql, Discord);}, 
		"!contact" 	: function(){contact(bot, msg, Discord);}, 
		//v2 preparation

		
		"!help" 	: function(){help(bot, msg, options, Discord);}, 
/**		//not ready
		"!ttc"		: function(){ttc(bot, msg, Discord);}, 
		"!subscribe": function(){subscribe(bot, msg, Discord, 0);}, 
		"!poll" 	: function(){poll(bot, msg, tokens, Discord);}, 
		"!vote" 	: function(){poll(bot, msg, tokens, Discord);}, 
		"!pledges" 	: function(){pledges(bot, msg, request, cheerio, Discord);}, 
		"!pledge" 	: function(){pledges(bot, msg, request, cheerio, Discord);}, 
		"!dailies" 	: function(){pledges(bot, msg, request, cheerio, Discord);}, 
		"!daily" 	: function(){pledges(bot, msg, request, cheerio, Discord);}, 
		"!weekly" 	: function(){trials(bot, msg, request, cheerio, util, Discord);}, 
		"!trials" 	: function(){trials(bot, msg, request, cheerio, util, Discord);}, 
		"!trial" 	: function(){trials(bot, msg, request, cheerio, util, Discord);}, 
		"!status" 	: function(){status(bot, msg, request, cheerio);}, 
		"!set" 		: function(){getset(bot, msg, Discord);}, 
//		"!setbonus" : function(){msg.channel.sendMessage("Please call the command with an argument, e.g. !set Magicka")}, 
//		"!test" 	: function(){msg.channel.sendMessage("No testing function at the moment ");}, 
//		"!fox" 		: function(){msg.channel.sendMessage("Yeah, the FoX!");}, 
		"!lfg" 		: function(){lfg(bot, msg, Discord)}, 
//		"!lfm" 		: function(){lfm(bot, msg, lfgdb)}, 
		"!patch" 	: function(){patchnotes(bot, msg, request, cheerio);}, 
		"!patchpts" : function(){patchpts(bot, msg, request, cheerio);}, 
		"!lb" 			: function(){leaderboards(bot, msg);}, 
		"!leaderboard" 	: function(){leaderboards(bot, msg);}, 
		"!leaderboards" : function(){leaderboards(bot, msg);}, 
		"!config" 		: function(){configure(bot, msg, Discord);}, 
**/		
		};
    	
	var fm = new FuzzyMatching(Object.keys(responses));
	
	var cmd = msg.content.split(" ")[0];
	if (fm.get(cmd).distance > 0.7)	options["command"] = fm.get(cmd).value
	
	console.log(returnObj)
	callback(returnObj);
	responses[options["command"]]
}
