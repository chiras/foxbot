// local data
const tokens = require('./tokens/dev.json');
const setitems = require('./data/setfile.json');

// required modules
const util = require('util')
const Discord = require("discord.js");
const request = require("request"); // necessary?
const cheerio = require('cheerio');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const FuzzyMatching = require('fuzzy-matching');
const sql      = require('mysql');
//const TwitchApi = require('twitch-api');

// local modules
const vendor = require('./modules/vendor.sql.js'); // v2 ready
const status = require('./modules/server.sql.js');
const getset = require('./modules/sets.db.js');
const getsetstats = require('./modules/setstats.js');
const help = require('./modules/help.js');
const pledges = require('./modules/pledges.js');
const trials = require('./modules/trials.js');
const log = require('./modules/log.js');
const gettwitch = require('./modules/twitch.js'); // v2 ready
const contact = require('./modules/contact.js');
const youtube = require('./modules/youtube.js');
const patchnotes = require('./modules/patchnotes.js');
const patchpts = require('./modules/patchnotes-pts.js');
const lfg = require('./modules/lfg.js');
const lfm = require('./modules/lfm.js');
const leaderboards = require('./modules/leaderboards.js');
const poll = require('./modules/vote.db.js');
const esoDBhook = require('./modules/esoDBhook.js');
const subscribe = require('./modules/subscribe.js');
const ttc = require('./modules/ttc.js');
const configure = require('./modules/settings.js');

// helper functions
const ah = require("./helper/arguments.js")

// logging requests 
const logfile = "logs/requests.log";
const logchannel = tokens["logging"]; 
const listenchannel = tokens["listening"];

// setting up global variables
var bot = new Discord.Client({autoReconnect:true});

var gsDayNames = new Array(
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
);

// mysql database
var mysql = sql.createPool({
  host     : 'localhost',
  user     : tokens["mysqluser"],
  password : tokens["mysqlpass"],
  database : 'foxbot'
});



// functions
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var dbguilds = new sqlite3.Database('./data/guilds.db'); // database file

function getDbRecords(db, arg, callback) {
db.serialize(function() {
    db.all("SELECT * FROM subscription WHERE guild IS '"+ arg+"'", function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all);
    });
});
};

function saveStats(options, sql){
	var key = options["command"]+":"+options["user"]+"@"+options["guild"]
	var query = 'INSERT into stats (id, guild, user, command, count) VALUES ("' + key +'", "' + options["guild"] +'", "' + options["user"]+'", "' + options["command"]+'", 1) ON DUPLICATE KEY UPDATE count = count + 1';
	//console.log(query)
	
	sql.query(query, function (error, results, fields) {
	  	if (error) console.log(error);
	});
}


const roleID = tokens["id"];

// listening for messages
bot.on("message", (msg) => {

	if(msg.channel.id == listenchannel){
		console.log("LISTENING")
		esoDBhook(bot, msg, Discord);
		return;
	}	

    // Set the prefix
    let prefix = "!";
    // Exit and stop if it's not there or another bot
    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;
   	
   	ah.argumentSlicer(msg, mysql, function(options){
    	
	var responses = {
		//v2 ready
		"!golden" 	: function(){vendor(bot, msg, options, mysql, "golden", Discord);}, 
		"!luxury" 	: function(){vendor(bot, msg, options, mysql, "luxury", Discord);}, 
		"!twitch" 	: function(){gettwitch(bot, msg, tokens["twitch"], Discord);}, //no help yet
		"!youtube" 	: function(){youtube(bot, msg, tokens["youtube"], options, mysql, Discord);}, 
		"!contact" 	: function(){contact(bot, msg, Discord);}, 
		"!help" 	: function(){help(bot, msg, options, Discord);}, 
		"!status" 	: function(){status(bot, msg, options, mysql, Discord);}, 
		"!lb" 			: function(){leaderboards(bot, msg, options, Discord);}, 
		"!leaderboard" 	: function(){leaderboards(bot, msg, options, Discord);}, 
		
		//v2 preparation

/**			//not ready
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
		"!set" 		: function(){getset(bot, msg, Discord);}, 
//		"!setbonus" : function(){msg.channel.sendMessage("Please call the command with an argument, e.g. !set Magicka")}, 
//		"!test" 	: function(){msg.channel.sendMessage("No testing function at the moment ");}, 
//		"!fox" 		: function(){msg.channel.sendMessage("Yeah, the FoX!");}, 
		"!lfg" 		: function(){lfg(bot, msg, Discord)}, 
//		"!lfm" 		: function(){lfm(bot, msg, lfgdb)}, 
		"!patch" 	: function(){patchnotes(bot, msg, request, cheerio);}, 
		"!patchpts" : function(){patchpts(bot, msg, request, cheerio);}, 
		"!config" 		: function(){configure(bot, msg, Discord);}, 
**/
		};
    	
	var fm = new FuzzyMatching(Object.keys(responses));
	
	var cmd = msg.content.split(" ")[0];
	
//	console.log(fm.get(cmd)); // --> { distance: 1, value: 'tough' } 
	
	if (fm.get(cmd).distance > 0.7){
		options["command"] = fm.get(cmd).value
		saveStats(options, mysql)
		
		if (tokens["tokenset"] == "live"){ 
			log(msg, cmd + " ("+msg.content+")", fs, logfile, bot);
		}

		var permission = 1;
		
        if (msg.guild) {
			
		if (!msg.channel.permissionsFor(roleID).hasPermission("READ_MESSAGES")){
			console.log("NOT READ_MESSAGES")
			msg.author.sendMessage("I do not have rights to READ MESSAGES in the channel you used the bot command. Please ask your admin to give me permission or switch channels!")
			permission = 0;
		}

		if (!msg.channel.permissionsFor(roleID).hasPermission("SEND_MESSAGES")){
			console.log("NOT SEND_MESSAGES")
			msg.author.sendMessage("I do not have rights to SEND MESSAGES in the channel you used the bot command. Please ask your admin to give me permission or switch channels!")
			permission = 0;
		}
	
		if (!msg.channel.permissionsFor(roleID).hasPermission("EMBED_LINKS")){
		console.log("NOT EMBED_LINKS")
			msg.author.sendMessage("I do not have rights to EMBED LINKS in the channel you used the bot command. Please ask your admin to give me permission or switch channels!")
			permission = 0;
		}
		
		if (permission){
		var p = new Promise(function(resolve, reject) {
			getDbRecords(dbguilds, msg.guild.id ,function(err, obj) {
        		resolve(obj);
			})
		}).then(function(value){
	     //console.log(value); 
	       
		if (value.length == 0){
			subscribe(bot, msg, Discord, 1); 
			console.log("new subscription")
		}

		}) // end promise guild channel
		}
		
		
		} // end if guild
	
		if (permission){
			if (responses[options["command"]]) {responses[options["command"]]();	
		}}else{
			log(msg, cmd + " <--- wrong permissions ", fs, logfile, bot);
		}


		
	
// 	} else if (msg.content.startsWith(prefix + "set")) {
//          getset(bot, msg, setitems);
// 	} else if (msg.content.startsWith(prefix + "poll") || msg.content.startsWith(prefix + "vote")) {
//          poll(bot, msg, tokens, Discord);
// 	} else if (msg.content.startsWith(prefix + "lb") || msg.content.startsWith(prefix + "leaderboard")) {
//          leaderboards(bot, msg);
// 	} else if (msg.content.startsWith(prefix + "lfg")) {
//          lfg(bot, msg, lfgdb);
// 	} else if (msg.content.startsWith(prefix + "lfm")) {
//          lfm(bot, msg, lfgdb, "");         
  //  } else if (msg.content.startsWith(prefix + "setbonus ")) {
  //  } else if (msg.content.startsWith(prefix + "setbonus ")) {
  //       getsetstats(bot, msg, setitems, util);
 //   } // else {
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
	} // end fuzzy search
  }) // end argument slicer

});

// startup
bot.on('ready', () => {
    console.log('Fox Bot initiated!');
    console.log('Running on ' +  bot.guilds.size + ' servers:');
    
    bot.user.setGame("!help for commands");

    var guildNames = bot.guilds.array().map(s=>s.name ).join("; ")
    console.log(guildNames);
	//mysql.connect();
});

bot.on('guildCreate', guild => {
	var guildCreate =  guild +  "\t" +  guild.owner + "\tGuild added\t\t";// + msg.createdAt;
	fs.appendFile(logfile, guildCreate , function (err) {});
	console.log(guildCreate);
    if (typeof bot.channels.get(logchannel) !=="undefined"){
  		bot.channels.get(logchannel).sendMessage(guildCreate)
	}
});

bot.on('error', error => {
    console.log(error);
    if (typeof bot.channels.get(logchannel) !=="undefined"){
	  	bot.channels.get(logchannel).sendMessage(error)
    }

    process.exit(1);
});

process.on('unhandledRejection', error => {
    console.log(error);
     if (typeof bot.channels.get(logchannel) !=="undefined"){
 			bot.channels.get(logchannel).sendMessage('-- Warning: unhandled Rejection received: '+error)
    }
});

bot.login(tokens["discord"]);