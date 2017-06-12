const moment = require('moment-timezone');
const mh = require("../helper/messages.js")

function saveStats(options, sql){
	var key = options["command"]+":"+options["user"]+"@"+options["guild"]
	var query = 'INSERT into stats (id, guild, user, command, count) VALUES ("' + key +'", "' + options["guild"] +'", "' + options["user"]+'", "' + options["command"]+'", 1) ON DUPLICATE KEY UPDATE count = count + 1';
	
	sql.query(query, function (error, results, fields) {
	  	if (error) console.log(error);
	});
}

module.exports = (msg, options, logchannel, bot, mysql, Discord) => {

	//console.log(msg)
	//console.log(options)
	//console.log(logchannel)


	var currentdate = moment().tz("Europe/Berlin").format("YYYY-MM-DD hh:mm") + " ";
	var embed = mh.prepare(Discord)

	var requesttext = currentdate
	
	if (typeof msg == "string"){
		requesttext += msg + " :star: " + options;
	}else{
		requesttext += options.command + " "
		if (msg.author){requesttext += msg.author.username + "@"}else{requesttext += "???@"}	
		if (msg.guild){requesttext += msg.guild.name + " "}else{requesttext += "DM "}
		requesttext += msg.content
		saveStats(options, mysql)
	}	
	
	//console.log(requesttext);
	bot.channels.get(logchannel).send(requesttext)

};

//https://discordapp.com/oauth2/authorize?client_id=252014532447305739&scope=bot

