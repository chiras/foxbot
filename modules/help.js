const mh = require("../helper/messages.js")

module.exports = (bot, msg, Discord) => {
	
	var helptext = mh.prepare(Discord);
	
	helptext.addField('Regular Events',	
							 "**!pledges** \t -> Today's Undaunted pledges\n"
							+"**!trials** \t -> This weeks's special trials\n"	
							)
							
	helptext.addField('Weekend Vendors',	
							 "**!golden** \t -> Cyrodiil Golden Vendor Items\n"
							+"**!luxury** \t -> Luxury Housing Vendor Items\n"	
							)
														

	helptext.addField('Official Information',	
							 "**!status** \t -> ESO server status\n"
							+"**!patch** \t -> Latest ESO patch notes\n"	
							+"**!patchpts** \t -> PTS (Morrowind) patch notes\n"	
							)

	helptext.addField('Game Information',	
							 "**!set SETNAME** \t -> Set item information (e.g. !set skel)\n"
							+"**!lb** \t -> Leaderboard scores (e.g. !lb $account, EU, HRC)\n"	
							)

	helptext.addField('Group Tools',	
							 " **!poll** \t -> Start a poll, vote and end it\n"
							)

	helptext.addField('Media',	
							 "**!youtube** \t -> Hot and new ESO videos\n"
							+"**!twitch** \t -> Current top 5 ESO streams\n"	
							)

	helptext.addField('Bot',	
							 "**!contact** \t -> Contact information for the Bot author\n"
//							+"**!subscribe** \t -> Automatic messages on events\n"
							+"**!help** \t -> This help page\n"	
							)
																												
	mh.send(msg.channel, helptext)
	
};