var guildID = "252014907770404864"

exports.createTemporaryRole = function(bot, callback) {
	bot.guilds.get(guildID).createRole({
 		 name: 'PUG',
  		 color: 'BLUE',
	})
	.then(role => console.log(`Created role ${role}`))
	.catch(console.error)
}; 

// exports.addToGuild = function(bot, user, callback) {
// 	bot.guilds.get(guildID).addMember(user, {"accessToken" : ""})
// 	.catch(console.error)
// }; 

exports.createTemporaryChannel = function(bot, name, callback) {
 bot.guilds.get(guildID).createChannel("a channel name here",'voice')
	 .then(channel => callback("dddd",`${channel}`))
	 .catch(console.error);
}; 


exports.deleteTemporaryChannel = function(bot, channel, callback) {
 bot.guilds.get(guildID).channels.get(channel).delete()
	 .then(channel => console.log(`Deleted channel ${channel}`))
	 .catch(console.error);
}; 


exports.checkTemporaryChannel = function(bot, channel, Discord, callback) {
	var members = bot.guilds.get(guildID).channels.get("313673746231590914").members
		.map(user => `${user}`)
	callback(members)
	
	//query.partial_groups = voiceChans.filter(c=>c.members.length<6&&c.members.length>0).length;
}; 

//https://discordapp.com/api/oauth2/token?client_id=252014532447305739&guilds=252014907770404864&members=313673746231590914
//https://discordapp.com/oauth2/authorize?client_id=252014532447305739&guilds=252014907770404864&members=313673746231590914