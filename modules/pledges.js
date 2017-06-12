const moment = require('moment-timezone');

const mh = require("../helper/messages.js")
const eh = require("../helper/events.js")


module.exports = (bot, msg, options, Discord) => {
var embed = mh.prepare(Discord)

if (options.options == "-help"){
    embed.setTitle("Options for " + options.command)
    embed.addField(options.command, "Shows the current and next pledges")
    embed.addField(options.command + "  Crypt of Hearts I", "Will prompt the days until this becomes pledge again")
    embed.addField(options.command + " 2017-04-28", "Shows pledges on the 28th April 2017")

}else{
	
if (options.others.length > 0 | options.instance.length > 0){ // end  date
	// here search for Dungeon
	var query = "";
	if (options.others.length > 0){
		query = options.others.join(" ");
	}else{
		query = options.instance[0]
	}
	eh.dungeon(query,function(query){
			embed.setDescription(query)
	})
	
	}else{// end text or date
		var time = moment().unix()
		var txt = "today are";
		if (options.date.length>0){
			time = moment.tz(options.date[0], "YYYY-MM-DD", "America/Toronto").add(8, 'hours').unix();
			if (time > moment().unix()){
				txt = "on the "+options.date[0].split("-").reverse().join(".")+" will be";
			}else{
				txt = "on the "+options.date[0].split("-").reverse().join(".")+" have been";
			}
		}
		
		eh.pledges(time, function(pledgesTxt, pledgesTxtNext){
    		embed.setAuthor("Undaunted Quartermaster Ilmeni Arelas says")
	//	   	embed.setFooter('Data obtained from www.esoleaderboards.com')		
			embed.addField("Pledges "+txt+":",pledgesTxt)
			if (options.date.length==0){
				embed.addField("Next pledges after those will be ",pledgesTxtNext)
			}
		})
	}
		
} // end not help
mh.send(msg, embed, options)

};
