const util = require('util')
var jsonfile = require('jsonfile')

var file = './data/subsdump.json'

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var ongoingSubs = {};

jsonfile.readFile(file, function(err, obj) {
	ongoingSubs = obj;
})


module.exports = (bot, msg, Discord) => {

        if (!msg.guild) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "Subscriptions only work in guild channels, not in direct messages to the bot."
            });
        return;    
    	}
        var curChannel = msg.channel.id;       

		let can_manage_chans = msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_CHANNELS");
		console.log(can_manage_chans);
    	
    	if (can_manage_chans){
    	 
 		//console.error(curChannel)

        var args = msg.content.split(" ").slice(1);
        const embed = new Discord.RichEmbed()
            .setAuthor("Channel subscription!")
            .setColor(0x800000)
                    	
    	
      	ongoingSubs[curChannel] = "all";
  	

    	if(args[0]){
    	if (args[0].startsWith("unsub")){
    	    	ongoingSubs[curChannel] = "none";
    	    	embed.setDescription("All subscriptions have been removed!")   
    	}else if (args[0].startsWith("new")){
     	    	ongoingSubs[curChannel] = "news";
    	    	embed.setDescription("You now receive only news for ESO!")   
    	}else if (args[0].startsWith("bot")){
     	    	ongoingSubs[curChannel] = "bot";
    	    	embed.setDescription("You now receive only updates on the Bot!")   
    	}
				embed.setDescription("No valid options provided, you can use \n**!subscribe**   --> News on ESO and Bot\n**!subscribe bot**   --> Only Bot updates (e.g. new commands)\n**!subscribe news**   --> News on ESO only\n**!subscribe unsub**   --> unsubscribe this channel\n\nYou are now subscribed to news for ESO and updates on the Bot!")  
    	
		}else{
	    	    embed.setDescription("You are now subscribed to news for ESO and updates on the Bot!")   
		}
		
    	msg.channel.sendEmbed(embed);

            
   		jsonfile.writeFile(file, ongoingSubs, function (err) {
 				 if(err){console.error(err)}
		}) 	

		console.log(ongoingSubs);
		}else{
            msg.channel.sendEmbed({
                color: 0x800000,
                description: 'Sorry, only users with permission to "manage channel" are able to change subscriptions'
            });		
		}
};
