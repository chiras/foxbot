const mh = require("../helper/messages.js")

module.exports = (bot, msg, options, type, Discord) => {
	if (type == "christmas"){
		var embed = mh.prepare(Discord);
		embed.setTitle("Oh you found something unusual!")
		embed.setDescription("This was a nice (real-life) christmas card to the Fox last year! Come back in some time and you may find hints for a new easter egg!")
		embed.setImage("http://i.imgur.com/On7rQPf.jpg")																										
		mh.send(msg, embed, options)
	}
	
};