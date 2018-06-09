// local data
const tokens = require('./tokens/live.json');
const setitems = require('./data/setfile.json');

// required modules
const Discord = require("discord.js");
const FuzzyMatching = require('fuzzy-matching');
const sql      = require('mysql');

// local modules
const vendor = require('./modules/vendor.sql.js'); // v2 ready
const status = require('./modules/server.sql.js');
const getset = require('./modules/sets.sql.js');
const help = require('./modules/help.js');
const pledges = require('./modules/pledges.js');
const trials = require('./modules/trials.js');
const log = require('./modules/log.js');
const gettwitch = require('./modules/twitch.js'); // v2 ready
const contact = require('./modules/contact.js');
const youtube = require('./modules/youtube.js');
const patchnotes = require('./modules/patchnotes.js');
const lfg = require('./modules/lfg.js');
const lfm = require('./modules/lfm.js');
const leaderboards = require('./modules/leaderboards.js');
const poll = require('./modules/vote.sql.js');
const esoDBhook = require('./modules/webhook.js');
//const esoDBhook = require('./modules/esoDBhook.js');
const subscribe = require('./modules/subscribe.js');
const ttc = require('./modules/ttc.sql.js');
const configure = require('./modules/settings.sql.js');
const guildUpdate = require('./modules/guild.sql.js');
const easteregg = require('./modules/easteregg.js');
const time = require('./modules/time.js');

// helper functions
const mh = require("./helper/messages.js")
const ah = require("./helper/arguments.js")
const dh = require("./helper/db.js")
const nh = require("./helper/names.js")
const xh = require("./helper/announcement.js")

// logging requests 
const logfile = "logs/requests.log";
const logchannel = tokens["logging"]; 
const listenchannel = tokens["listening"];

// setting up global variables
var bot = new Discord.Client({autoReconnect:true});

//console.log(bot);

const roleID = tokens["id"];
const blacklist = ["!roll"]

// mysql database
var mysql = sql.createPool({
  host     : 'localhost',
  user     : tokens["mysqluser"],
  password : tokens["mysqlpass"],
  database : 'foxbot',
  multipleStatements: true
});

//console.log(roleID);

// listening for messages
bot.on("message", (msg) => {
	if(msg.channel.id == listenchannel){
		console.log("LISTENING")
		esoDBhook(bot, msg, {bot : bot}, mysql, Discord);
		return;
	}	

    // Set the prefix
    let prefix = "!";
    // Exit and stop if it's not there or another bot
    if (!msg.content.startsWith(prefix)) return;
    if (msg.content.startsWith(prefix+prefix)) return;
    if (msg.author.bot) return;

    console.log(msg.author.id +" -> " + msg.content)
    
   	guildUpdate(bot, msg, mysql)   	
   	
   	ah.argumentSlicer(msg, mysql, function(options){
   	var checkdbchannel = options["guild"]
   	if (checkdbchannel =="DM") checkdbchannel = options["user"]

	/// announcement check here
   	xh.announce(mysql, options, bot, Discord, function(result){
   		console.log(result)
   	})
   	
   	dh.getDbData(mysql, "guilds_settings", {settingsid: checkdbchannel}, function(settings) {  
   	dh.getDbData(mysql, "guilds_users", {userid: options["user"], guild : options["guild"]}, function(users) {  
   	
   	var blacklistChannel = [...blacklist];
   	//console.log(settings)
   	for (var s = 0; s < settings.length; s++){
   		if (settings[s].setting == "-deny" && typeof users[0] !== "undefined" && users[0].role == settings[s].sap) blacklistChannel.push("!"+settings[s].value) // SOME ERROR here in beta test with sha.
   		if (settings[s].setting == "-megaserver" && options.megaservers.length==0 && settings[s].value != 0) options.megaservers.push(Object.keys(nh.listServers())[settings[s].value-1].toUpperCase())
   		if (settings[s].setting == "-replytype" && settings[s].value == 1 && options.command != "!config" && options.command != "!poll") options["rechannel"] = "redirectDM"
   		if (settings[s].setting == "-replytype" && settings[s].value == 2 && options.command != "!config" && options.command != "!poll") {options["rechannel"] = "redirectChannel"; options["rechannelid"] = settings[s].sap}
		if (settings[s].setting == "-timezone") options["timezone"] = settings[s].value
	}
   	
   	//console.log("blacklist: "+blacklistChannel.join(","))
   	
   	if (blacklistChannel.includes(options["command"][0])) return;

	//console.log(options)
   		   	
	var responses = {
		//v2 ready
		"!golden" 		: function(){vendor(bot, msg, options, mysql, "golden", Discord);}, 
		"!luxury" 		: function(){vendor(bot, msg, options, mysql, "luxury", Discord);}, 
		"!twitch" 		: function(){gettwitch(bot, msg, tokens["twitch"], options, Discord);}, //no help yet
		"!youtube" 		: function(){youtube(bot, msg, tokens["youtube"], options, mysql, Discord);}, 
		"!contact"	 	: function(){contact(bot, msg, options, Discord);}, 
		"!help" 		: function(){help(bot, msg, options, Discord);}, 
		"!fox" 		: function(){help(bot, msg, options, Discord);}, 
		"!status" 		: function(){status(bot, msg, options, mysql, Discord);}, 
		"!server" 		: function(){status(bot, msg, options, mysql, Discord);}, 
		"!realm" 		: function(){status(bot, msg, options, mysql, Discord);}, 
		"!lb" 			: function(){leaderboards(bot, msg, options, Discord);}, 
		"!leaderboard" 	: function(){leaderboards(bot, msg, options, Discord);}, 
		"!pledge" 		: function(){pledges(bot, msg, options,  Discord);}, 
		"!dailies" 		: function(){pledges(bot, msg, options,  Discord);}, 
		"!daily" 		: function(){pledges(bot, msg, options,  Discord);}, 
		"!weekly" 		: function(){trials(bot, msg, options, Discord);}, 
		"!trial" 		: function(){trials(bot, msg, options, Discord);}, 
		"!patch" 		: function(){patchnotes(bot, msg, options, Discord);}, 
		"!patchpts" 	: function(){patchnotes(bot, msg, options, Discord);}, 
		"!set" 			: function(){getset(bot, msg, options, Discord);}, 
		"!price"		: function(){ttc(bot, msg, options, Discord);}, 
		"!christmas"	: function(){easteregg(bot, msg, options, "christmas", Discord);}, 
		"!time" 		: function () { time(bot, msg, options, Discord); },
		
		//v2 preparation
		
			// needs help, troubleshoot and user poll list in DM
		"!poll" 		: function(){poll(bot, msg, tokens, options, mysql, Discord);}, 
		"!vote" 		: function(){poll(bot, msg, tokens, options, mysql, Discord);}, 

		"!config" 		: function(){configure(bot, msg, options, mysql, Discord);}, 

/**			//not ready			
		"!lfg" 		: function(){lfg(bot, msg, Discord)}, 
//		"!lfm" 		: function(){lfm(bot, msg, lfgdb)}, 
**/
		};
    	
	var fm = new FuzzyMatching(Object.keys(responses));
	
	var cmd = msg.content.split(" ")[0];
		var fuzzymatch = fm.get(cmd);
		
		if (fuzzymatch.distance > 0.7){
		options["command"] = fuzzymatch.value
		
    	if (typeof bot.channels.get(logchannel) !=="undefined" && tokens["tokenset"] == "live"){
			log(msg, options, logchannel, bot, mysql, Discord);
		}

		if (!options["rechannel"]){
			options["rechannel"] = "DM"
		
        	if (msg.guild) {
       			options["rechannel"] = "guild"
        			
				if (!msg.channel.permissionsFor(roleID).has("READ_MESSAGES")){
					options["rechannel"] = "read";
				}

				if (!msg.channel.permissionsFor(roleID).has("SEND_MESSAGES")){
					options["rechannel"] = "send";
				}
	
				if (!msg.channel.permissionsFor(roleID).has("EMBED_LINKS")){
					options["rechannel"] = "embed";
				}
				
			}// end if guild
		} // no preset rechannel
		
		options["bot"] = bot.user.id;
		options["client"] = bot;
		//console.log(options["bot"])
		//console.log(options)
		
		if (responses[options["command"]]) {responses[options["command"]]()};	

	} // end fuzzy search
	})}) // db settings
  }) // end argument slicer
});

function countGuilds() {
  
  bot.shard.fetchClientValues('guilds.size')
 	 .then(results => {
  		  console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
			bot.user.setActivity(`!fox on ${results.reduce((prev, val) => prev + val, 0)}  servers`); 	 
	 })
 	 .catch(console.error);
}

// startup
bot.on('ready', () => {
    console.log('Fox Bot initiated!');
 	console.log("SHARD: "+bot.shard.id + "/" + bot.options.shardCount);
    console.log('Shard running on ' +  bot.guilds.size + ' servers:');
    
    setTimeout(countGuilds, 30000);
    
    //var guildNames = bot.guilds.array().map(s=>s.name ).join("; ")
    //console.log(guildNames);
});


bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));


bot.on('guildCreate', guild => {
    if (typeof bot.channels.get(logchannel) !=="undefined"){
		log("guildCreate", guild, logchannel, bot, mysql, Discord);
	}
	setTimeout(countGuilds, 1000);
});

bot.on('error', error => {
    console.log(error);
    if (typeof bot.channels.get(logchannel) !=="undefined"){
	  	bot.channels.get(logchannel).send(error)
    }

    process.exit(1);
});

process.on('unhandledRejection', error => {
    console.log(error);
     if (typeof bot.channels.get(logchannel) !=="undefined"){
 			bot.channels.get(logchannel).send('-- Warning: unhandled Rejection received: '+error)
    }
});

bot.login(tokens["discord"]);