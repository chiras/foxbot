
const mh = require("../helper/messages.js")

var help = {
	'Regular Events':{
							 "!pledges": "Today's Undaunted pledges",
							 "!trials":"This weeks's special trials"	
							},
							
	'Weekend Vendors':	{
							 "!golden":"Cyrodiil Golden Vendor Items",
							 "!luxury":"Luxury Housing Vendor Items"	
							},
														

	'Official Information':{	
							 "!status":"ESO server status",
							 "!patch":"Latest ESO patch notes",	
							},

	'Game Information':{	
							 "!set":"Set item information (e.g. !set skel)",
							 "!price":"Prices of listed items in guild vendor",
							 "!lb":"Leaderboard scores (e.g. !lb $account, EU, HRC)"	
							},

	'Group Tools':{	
							 "!poll":"Start and end a poll",
							 "!vote":"Vote on an existing poll",
							 "!time":"Time conversion tool"
							},

	'Media':	{
							 "!youtube":"Hot, new and recommended ESO videos",
							 "!twitch":"Current top 5 ESO streams"	
							},

	'Bot':	{
							 "!config":"Configuration options for guilds and users",
							 "!contact":"Contact information for the Bot author",
							 "!help":"This help page",	
							 "!fox":"Help page that avoids conflicts with other bots"	
							}							
}

var golden = function(embed){

        embed.setTitle("Options for " + options.command)
        embed.addField(options.command, "Shows this help")
        embed.addField(options.command + " text", "Shows matches for this text in the set name. Partial names and single types should also yield results. If no set with that name can be found, it will search through the set boni for your query. Try: \n**!set Pirate Skeleton** \n**!set skel** \n**!set spell damage**")
        embed.addField(options.command + " -bonus ", "Searches only through boni, not the names. This will help when set names are prioritized but interested in the boni. Try: \n**!set magicka** \n**!set -bonus magicka** \n**!set max magicka** ")
        embed.addField(options.command + " -all ", "Forces a list of all set names")
        embed.addField(options.command + " -tooltip ", "Will also produce directly viewable tooltips instead of links for every resulting set (very slow and needs a lot of space!)")
        return embed;
}

module.exports = (bot, msg, options, Discord) => {
	var embed = mh.prepare(Discord);

	if (options.options[0]=="-details"){
	for (var helpGrp in help){
		var helptxt = ""
		for (var helpCommand in help[helpGrp]){
		 	helptxt += "**"+helpCommand+"**: "+ help[helpGrp][helpCommand]+"\n"
		}
		embed.addField(helpGrp,helptxt)
	}
	}else{
		var helptxt = ""
		for (var helpGrp in help){
			helptxt += "**"+helpGrp+"**: " +  Object.keys(help[helpGrp]).join(", ")	+ "\n"
		}		
		embed.addField("Available commands: ", helptxt)		
		embed.addField("Do you need more details? ", "**!help -details**: some more details")
		embed.addField("Command help", "**Every** command now has a help page! \ne.g. **!set -help** or **!price -help**")
        embed.setAuthor("List of available commands")
        embed.setDescription("Full documentation is now online available at: http://foxbot.biotopia.info")
	}	
																												
	mh.send(msg, embed, options)
	
};
