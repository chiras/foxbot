
module.exports = (bot, msg, options, mysql, Discord) => {

//see if that channel is still accessible to the bot
var channel = msg.channel.id;
console.log(channel)

if (typeof bot.channels.get(channel) !== "undefined"){
	console.log("OK" + typeof bot.channels.get(channel))
}else{
	console.log("NOT" + typeof bot.channels.get(channel))
}

};

// testing: https://woeler.eu/test/discord.php