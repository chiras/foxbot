const sqlite3 = require('sqlite3').verbose(); // db module
const util = require('util')

var dbguilds = new sqlite3.Database('./data/guilds.db'); // database file

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

function getDbInserts(db, args, callback) {
db.serialize(function() {
        db.each("INSERT OR REPLACE into subscription (guild, channel, news, bot, regular) VALUES ('" + args['guild'] + "', '" + args['channel'] + "','" + args['news'] + "','" + args['bot'] + "','" + args['regular'] + "')", function(err, row) {
            if (err) {
                console.log(err)
            } else {

            }
        });
});
};


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = (bot, msg, Discord, firsttime) => {

        if (!msg.guild) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "Subscriptions only work in guild channels, not in direct messages to the bot."
            });
        return;    
    	}

		let can_manage_chans = msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_CHANNELS");
	//	console.log(can_manage_chans);
    	
    	if (can_manage_chans){
    	   	
    	var insertArgs = {"guild" : msg.guild.id, "channel" : msg.channel.id, "news" : 0, "bot" : 0, "regular" : 0}
    	
        var args = msg.content.split(" ").slice(1).join(" ").replace(/ /g, "").split(",");
        const embed = new Discord.RichEmbed()
            .setAuthor("The Prophet says")
            .setColor(0x800000)
                    	    	
  	
    	if(args[0]){
    	for (var i = 0; i < args.length; i++){
    	
    	if (args[i].startsWith("unsub")){
    	    	embed.setDescription("All subscriptions have been removed!")   
    	}else if (args[i].startsWith("new")){
    	    	insertArgs["news"] = 1;
    	}else if (args[i].startsWith("bot")){
    	    	insertArgs["bot"] = 1;
    	}else if (args[i].startsWith("reg")){
    	    	insertArgs["regular"] = 1;
    	}
       	} // end for
 	
		}else{
    			insertArgs = {"guild" : msg.guild.id, "channel" : msg.channel.id, "news" : 1, "bot" : 1, "regular" : 1}
		}
		
		var tmpText = "...";
    	for (var i = 2; i < Object.keys(insertArgs).length; i++){
    		tmpText += "\n* "+ notiNames[Object.keys(insertArgs)[i]]+": ";
    		if (insertArgs[Object.keys(insertArgs)[i]]){
    			tmpText += "yes"
    		}else{
    			tmpText += "no"
    		}	
		}
		
		if (firsttime){
	    	embed.setDescription("I am now able to tell you about new things happening in the world of Tamriel, almost instantly when they come alight. I will now tell you whenever there is need, about" + tmpText + "\n\n If you want to change this, or want this to happen in a different channel, you can tell me in the desired channel with \n**!subscribe** (for all options) \n**!subscribe news, bot** (options: \"news\", \"bot\", \"regular\")  \n**!subscribe unsub** (to quiet me). \n\n This message is only send once!")   		
		}else{		
	    	embed.setDescription("You have changed the ways you want to get new insights into the world of Tamriel. I will now tell you whenever there is need, about" + tmpText + "\n\n If you change your mind, you can tell me with \n**!subscribe** (for all options) \n**!subscribe news, bot** (options: \"news\", \"bot\", \"regular\")  \n**!subscribe unsub** (to quiet me)")   
		}
		
     	getDbInserts(dbguilds,insertArgs)     	
   		msg.channel.sendEmbed(embed);

		}else{
            msg.channel.sendEmbed({
                color: 0x800000,
                description: 'Sorry, only users with permission to "manage channel" are able to change subscriptions'
            });		
		}
};
