// required modules
const util = require('util')
const Discord = require("discord.js");
const request = require("request");
const cheerio = require('cheerio');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
//const TwitchApi = require('twitch-api');

// local data
const tokens = require('./tokens/dev.json');
const setitems = require('./data/setfile.json');
const lfgdb = new sqlite3.Database('./data/lfg.db');

// local modules
const golden = require('./modules/golden.js');
const luxury = require('./modules/luxury.js');
const status = require('./modules/server.js');
const getset = require('./modules/sets.js');
const getsetstats = require('./modules/setstats.js');
const help = require('./modules/help.js');
const pledges = require('./modules/pledges.js');
const trials = require('./modules/trials.js');
const log = require('./modules/log.js');
const gettwitch = require('./modules/twitch.js');
const contact = require('./modules/contact.js');
const youtube = require('./modules/youtube.js');
const patchnotes = require('./modules/patchnotes.js');
const patchpts = require('./modules/patchnotes-pts.js');
const lfg = require('./modules/lfg.js');
const lfm = require('./modules/lfm.js');
const leaderboards = require('./modules/leaderboards.js');
const poll = require('./modules/vote.js');

// logging requests 
const logfile = "logs/requests.log";
const logchannel = "301074654301388800"

// setting up global variables
var bot = new Discord.Client();

var gsDayNames = new Array(
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
);

// functions
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}



// listening for messages
bot.on("message", (msg) => {
    // Set the prefix
    let prefix = "!";
    // Exit and stop if it's not there or another bot
    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;

	if (tokens["tokenset"] == "live"){ log(msg, msg.content, fs, logfile, bot);}

	
	
	var responses = {
		"!help" 	: function(){help(bot, msg);}, 
		"!poll" 	: function(){poll(bot, msg, tokens, Discord);}, 
		"!pledges" 	: function(){pledges(bot, msg, request, cheerio);}, 
		"!pledge" 	: function(){pledges(bot, msg, request, cheerio);}, 
		"!dailies" 	: function(){pledges(bot, msg, request, cheerio);}, 
		"!daily" 	: function(){pledges(bot, msg, request, cheerio);}, 
		"!trials" 	: function(){trials(bot, msg, request, cheerio, util);}, 
		"!trial" 	: function(){trials(bot, msg, request, cheerio, util);}, 
		"!golden" 	: function(){golden(bot, msg, gsDayNames, request, cheerio);}, 
		"!luxury" 	: function(){luxury(bot, msg, gsDayNames, request, cheerio);}, 
		"!status" 	: function(){status(bot, msg, request, cheerio);}, 
		"!set" 		: function(){msg.channel.sendMessage("Please call the command with at least some characters of the setname, e.g. !set skel")}, 
		"!setbonus" : function(){msg.channel.sendMessage("Please call the command with an argument, e.g. !set Magicka")}, 
		"!test" 	: function(){msg.channel.sendMessage("No testing function at the moment ");}, 
		"!fox" 		: function(){msg.channel.sendMessage("Yeah, the FoX!");}, 
		"!twitch" 	: function(){gettwitch(bot, msg, tokens["twitch"], util, request);}, 
		"!youtube" 	: function(){youtube(bot, msg, request, youtube);}, 
		"!lfg" 		: function(){lfg(bot, msg, lfgdb)}, 
		"!lfm" 		: function(){lfm(bot, msg, lfgdb)}, 
		"!patch" 	: function(){patchnotes(bot, msg, request, cheerio);}, 
		"!patchpts" : function(){patchpts(bot, msg, request, cheerio);}, 
		"!contact" 	: function(){contact(bot, msg);}, 
		"!lb" 			: function(){leaderboards(bot, msg);}, 
		"!leaderboard" 	: function(){leaderboards(bot, msg);}, 
		"!leaderboards" : function(){leaderboards(bot, msg);}, 
		};


	// var yyy = pledges(bot, msg, request, cheerio);


	if (responses[msg]) {responses[msg]();
	} else if (msg.content.startsWith(prefix + "set")) {
         getset(bot, msg, setitems);
	} else if (msg.content.startsWith(prefix + "poll") || msg.content.startsWith(prefix + "vote")) {
         poll(bot, msg, tokens, Discord);
	} else if (msg.content.startsWith(prefix + "lb") || msg.content.startsWith(prefix + "leaderboard")) {
         leaderboards(bot, msg);
	} else if (msg.content.startsWith(prefix + "lfg")) {
         lfg(bot, msg, lfgdb);
	} else if (msg.content.startsWith(prefix + "lfm")) {
         lfm(bot, msg, lfgdb, "");         
  //  } else if (msg.content.startsWith(prefix + "setbonus ")) {
  //  } else if (msg.content.startsWith(prefix + "setbonus ")) {
  //       getsetstats(bot, msg, setitems, util);
    } // else {
//          	msg.channel.sendEmbed({
//   				color: 0x800000,
//   				title:"Command not found",
//   				description: " try one of: " + Object.keys(responses).join(", "),
//   				fields: [{
//        				 name: "Your suggestion?",
//        				 value: "If you feel that your command should be implemented into the bot, contact <@218803587491299328>"
//      			 }
//     			]    		
// 			});			
//     }  
        
//currently disabled the unknown command because of other both's interferring

});

// startup
bot.on('ready', () => {
    console.log('Fox Bot initiated!');
    console.log('Running on ' +  bot.guilds.size + ' servers:');
    
    bot.user.setGame("!help for commands");

    var guildNames = bot.guilds.array().map(s=>s.name ).join("; ")
    console.log(guildNames);

});

bot.on('guildCreate', guild => {
	var guildCreate =  guild +  "\t" +  guild.owner + "\tGuild added\t\t";// + msg.createdAt;
	fs.appendFile(logfile, guildCreate , function (err) {});
	console.log(guildCreate);
  	bot.channels.get(logchannel).sendMessage(guildCreate)

});

bot.on('error', error => {
    console.log(error);
  	bot.channels.get(logchannel).sendMessage(error)

    process.exit(1);
});

process.on('unhandledRejection', error => {
  	bot.channels.get(logchannel).sendMessage('-- Warning: unhandled Rejection received')

});

bot.login(tokens["discord"]);