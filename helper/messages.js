//const Discord = require("discord.js");

exports.prepare = function(Discord, callback) {
    var embed = new Discord.RichEmbed()
        .setColor(0x800000)

    return embed;
};

const urlbase = "http://foxbot.biotopia.info/?page_id="

const urls = {	"!pledge" 	: urlbase+"54",
				"!config" 	: urlbase+"91",
				"!help" 	: urlbase+"33",
				"!trial"	: urlbase+"74",
				"!twitch"	: urlbase+"148",
				"!youtube"	: urlbase+"150"

	}

exports.send = function(msg, embed, options, callback) {
		if (urls[options["command"]]) embed.setURL(urls[options["command"]])
		//if (!embed["title"]) embed.setTitle(">>"+options["command"] + " documentation<<\n")
		
	 	if (JSON.stringify(embed["fields"]).replace(/\(http:.*?\)/g, "").length > 2500 && msg.guild){
	 		// non greedy length without hyperlinks
 			options["rechannel"]= "lengthRedirect"
 		}
		
        //console.log("return: " + options["rechannel"])
        
        if (["embed", "read", "send"].includes(options["rechannel"])) {
            embed.addField("Direct message reply", "You receive this here, because your guild settings dont allow the bot to " + options["rechannel"].toUpperCase() + " messages in that channel. Speak to an admin to fix, use a different channel or use this direct message in the future.\n\nIf you don't want the bot to respond to this command at all, try to use **!config** for blacklisting in the guild channel.")
            msg.author.send({embed: embed});
            
        } else if (["lengthRedirect"].includes(options["rechannel"]) && msg.guild) {
            //embed.addField("Direct message reply", "You receive this here, because the answer was very long and we don't want to spam the guild channel.")
            msg.author.send({embed: embed});
            
      //       var embed2 = this.prepare(Discord);
//             embed2.setDescription("The answer was were long and has thus been send to you as a direct message.")
//            	msg.channel.send({embed: embed2});
            
                        
        }else if (options["command"] != "poll" && options["command"] != "config" && (options["rechannel"] == "DM" ||  options["rechannel"] == "" ||  options["rechannel"] == "guildDM" ||  options["rechannel"] == "redirectDM")) {
            msg.author.send({embed: embed});
			
			if (options["rechannel"] != "DM"){
            	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {msg.delete(600)}
            }
            
            

        } else if (options["rechannel"] == "redirectChannel") {
            if (msg.guild.members.get(options["bot"]).permissionsIn(msg.guild.channels.get(options["rechannelid"])).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
                    if (options.channel != options["rechannelid"]) {
                        embed.addField("Redirection", "This is a redirect of the " + options["command"] + " request of <@" + options["user"] + "> in another channel.")
                     	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {
                    		msg.delete(60)
                		}
                    }
                    msg.guild.channels.get(options["rechannelid"]).send({embed: embed});
                } else {
           			embed.addField("Direct message reply", "You receive this here, because your guild settings don't allow the bot to EMBED or SEND messages in that channel. Speak to an admin to fix.\n\nIf you don't want the bot to respond to this command at all, try to use **!config** for blacklisting in the guild channel.")
                    msg.author.send({embed: embed});
                     	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {
                    		msg.delete(60)
                		}                    
                }

            }else if (options["rechannel"] == "announceChannel"){
				options["bot"].channels.get(options["rechannelid"]).send({embed: embed})
            
            }else if (options["rechannel"] == "announceUser"){
				options["bot"].users.get(options["rechannelid"]).send({embed: embed})
            
            }else {
               msg.channel.send({embed: embed});
            }

        };