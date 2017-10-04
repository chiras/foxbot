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
				"!youtube"	: urlbase+"150",
				"!golden"	: urlbase+"172"

	}
			 
			 
exports.send = function(msg, embed, options, callback) {
		var helpurl = "http://foxbot.biotopia.info"
		if (urls[options["command"]]){helpurl = urls[options["command"]]}
		//console.log(embed)
			
	//	embed.setURL(helpurl)
// 		
// 		if (typeof embed.description == "undefined"){
// 			embed.setDescription("[:closed_book:]("+helpurl+")")
// 		}
		//if (!embed["title"]) embed.setTitle(">>"+options["command"] + " documentation<<\n")
		
	 	if (JSON.stringify(embed["fields"]).replace(/\(http:.*?\)/g, "").length > 2500 && msg.guild){
	 		// non greedy length without hyperlinks
 			options["rechannel"]= "lengthRedirect"
 		}
		
        //console.log("return: " + options["rechannel"])
        
        if (["embed", "read", "send"].includes(options["rechannel"])) {
            embed.addField("Direct message reply", "You receive this here, because your guild settings dont allow the bot to " + options["rechannel"].toUpperCase() + " messages in that channel. Speak to an admin to fix, use a different channel or use this direct message in the future.\n\nIf you don't want the bot to respond to this command at all, try to use **!config** for blacklisting in the guild channel.")

			 		try {
            			msg.author.send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (9): " + err)			 		
			 		} 
            
        } else if (["lengthRedirect"].includes(options["rechannel"]) && msg.guild) {
            //embed.addField("Direct message reply", "You receive this here, because the answer was very long and we don't want to spam the guild channel.")

			 		try {
          				msg.author.send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (8): " + err)			 		
			 		}  
            
      //       var embed2 = this.prepare(Discord);
//             embed2.setDescription("The answer was were long and has thus been send to you as a direct message.")
//            	msg.channel.send({embed: embed2});
            
                        
        }else if (options["command"] != "poll" && options["command"] != "config" && (options["rechannel"] == "DM" ||  options["rechannel"] == "" ||  options["rechannel"] == "guildDM" ||  options["rechannel"] == "redirectDM")) {

			 		try {
            			msg.author.send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (7): " + err)			 		
			 		}  
			
			if (options["rechannel"] != "DM"){
            	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {msg.delete(600)}
            }
            
            

        } else if (options["rechannel"] == "redirectChannel") {
        	console.log(options["rechannelid"])
            if (msg.guild.members.get(options["bot"]).permissionsIn(msg.guild.channels.get(options["rechannelid"])).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
                    if (options.channel != options["rechannelid"]) {
                        embed.addField("Redirection", "This is a redirect of the " + options["command"] + " request of <@" + options["user"] + "> in another channel.")
                     	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {
                    		msg.delete(60)
                		}
                    }

			 		try {
                    	msg.guild.channels.get(options["rechannelid"]).send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (6): " + err)			 		
			 		}    

                } else {
           			embed.addField("Direct message reply", "You receive this here, because your guild settings don't allow the bot to EMBED or SEND messages in that channel. Speak to an admin to fix.\n\nIf you don't want the bot to respond to this command at all, try to use **!config** for blacklisting in the guild channel.")

			 		try {
                    	msg.author.send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (5): " + err)			 		
			 		}  


                     	if (msg.guild.members.get(options["bot"]).permissionsIn(msg.channel).has("MANAGE_MESSAGES")) {
                    		msg.delete(60)
                		}                    
                }

            }else if (options["rechannel"] == "announceChannel"){ // for automatic announcements through esoDBhook
             if(typeof options["client"].channels.get(options["rechannelid"]) !== "undefined"){ // only guild channels that still exist pass this
             if(options["client"].channels.get(options["rechannelid"]).type == "text" ){ // guild channel and has permissions
			 	if (options["client"].channels.get(options["rechannelid"]).permissionsFor(options["client"].user) != null && options["client"].channels.get(options["rechannelid"]).permissionsFor(options["client"].user).has(["SEND_MESSAGES", "EMBED_LINKS"])){
			 		console.log("GC announcement "+options["rechannelid"])
			 		try {
			 			options["client"].channels.get(options["rechannelid"]).send({embed: embed})
			 			}
			 		catch (err){
			 			console.log("Delivery failed (4): " + err)			 		
			 		}
			 	}else{			 	
			 		console.log("GC no perms "+options["rechannelid"])
			 	}
			 }else{ // user DM, should already be redirected to announceUser, but to be sure!
			 		console.log("DM announcement "+options["rechannelid"])
			 		try {
			 	    	options["client"].channels.get(options["rechannelid"]).send({embed: embed})
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (3): " + err)			 		
			 		}
		     }
		     }else{
			 		console.log("channel undefined "+options["rechannelid"])		     		     
		     }           
            
//            	if (options["bot"].channels.get(options["rechannelid"])){
//					options["bot"].channels.get(options["rechannelid"]).send({embed: embed})
//				}

            }else if (options["rechannel"] == "announceUser"){
			 	if (typeof options["client"].users.get(options["rechannelid"]) !== "undefined"){
				 	console.log("D2 announcement "+options["rechannelid"])
			 		try {
			 			options["client"].users.get(options["rechannelid"]).send({embed: embed})
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (2): " + err)			 		
			 		}

			 	}
            
            }else {
            
			 		try {
          			     msg.channel.send({embed: embed});
			 	    }
			 		catch (err){
			 			console.log("Delivery failed (1): " + err)			 		
			 		}            
            }

        };