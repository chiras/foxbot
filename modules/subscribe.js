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


module.exports = (bot, msg) => {

        if (!msg.guild) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "Subscriptions only work in guild channels, not in direct messages to the bot."
            });
        return;    
    	}
        var curChannel = msg.channel.id;       
 		//console.error(curChannel)

        var args = msg.content.split(" ").slice(1);
            	
    	
      	ongoingSubs[curChannel] = "all";
  	

    	if(args[0]){
    	if (args[0].startsWith("unsub")){
    	    	ongoingSubs[curChannel] = "none";
    	}else if (args[0].startsWith("news")){
     	    	ongoingSubs[curChannel] = "news";
    	}else if (args[0].startsWith("bot")){
     	    	ongoingSubs[curChannel] = "bot";
    	}
    	
		}
   		jsonfile.writeFile(file, ongoingSubs, function (err) {
 				 if(err){console.error(err)}
		}) 	

		console.log(ongoingSubs);

};
