const mh = require("../helper/messages.js")
const eh = require("../helper/events.js")


module.exports = (bot, msg, request, cheerio, Discord) => {

// !pledges Volenfell
// !pledges 2017-03-01

	console.log("HERE")

	eh.pledges(function(pledgesTxt, pledgesTxtNext){
	
		var embed = mh.prepare(Discord)
    	embed.setAuthor("Undaunted Quartermaster Ilmeni Arelas says")//,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
	   	embed.setFooter('Data obtained from www.esoleaderboards.com')
//   	embed.setThumbnail('http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png')
		
		embed.addField("Today's pledges are",pledgesTxt)
		embed.addField("Next pledges will be ",pledgesTxtNext)

	   	mh.send(msg.channel, embed)
	})

};
