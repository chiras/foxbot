exports.prepare = function(Discord, callback) {
    var embed = new Discord.RichEmbed()
        .setColor(0x800000)

    return embed;
};

exports.send = function(msg, embed, options, callback) {
        //console.log("return: " + options["rechannel"])
        
        if (["embed", "read", "send"].includes(options["rechannel"])) {
            embed.addField("Direct message reply", "You receive this here, because your guild settings dont allow the bot to " + options["rechannel"].toUpperCase() + " messages in that channel. Speak to an admin to fix, use a different channel or use this direct message in the future.\n\nIf you don't want the bot to respond to this command at all, try to use **!config** for blacklisting in the guild channel.")
            msg.author.send({embed: embed});
            
        } else if (options["rechannel"] == "DM" ||  options["rechannel"] == "" ||  options["rechannel"] == "guildDM" ||  options["rechannel"] == "redirectDM") {
            msg.author.send({embed: embed});
			
			if (options["rechannel"] != "DM"){
            	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {msg.delete(60)}
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