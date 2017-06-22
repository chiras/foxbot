// v2 ready

const request = require("request");
const mh = require("../helper/messages.js")

module.exports = (bot, msg, clientid, options, Discord) => {  
		var embed = mh.prepare(Discord)

 if (options.options.includes("-help")) {
    	embed.setTitle("Options for " + options.command)
        embed.addField(options.command, "Shows current top streams")
        embed.addField(options.command + " text", "Shows matches for this query in the twitch stream and channel name")
        mh.send(msg, embed, options)
		
    } else {
    	embed.setTitle("ESO Twitch streams")
   		embed.setDescription("\n")
   				     
        var twitchurl = "https://api.twitch.tv/kraken/streams?game=The%20Elder%20Scrolls%20Online&live=true&limit=20&sort=views&language=en&client_id="+clientid;
        var type = "streams"
        var args = msg.content.split(" ").slice(1)
    	if (args.length>0){
    		twitchurl 		=  "https://api.twitch.tv/kraken/search/streams/?client_id="+clientid+"&query="+encodeURI(args.join(" "))+"&live=true&limit=20&sort=views";
     		embed.setTitle("Twitch search")
   		}		
		
		
		
		request({
    		url: twitchurl,
        	json: true
	    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {

			var twitchout = "";
  			var maxcount = 5;
 			var curcount = 0;
 			if (body[type].length < 6) maxcount = body[type].length

			if (body[type].length > 0){
  			for (var i = 0; curcount < maxcount; i++){
  			  	if (body[type][i]){
  			  		embed.addField(JSON.stringify(body[type][i].channel.display_name).replace(/\"/g, "")+ " (" + JSON.stringify(body[type][i].viewers) + ' Viewers): ' ,"[" + JSON.stringify(body[type][i].channel.status) + "](http://twitch.tv/"+body[type][i].channel.display_name+")")
					curcount++;
				}
  			}
			}else{
   			  		embed.setDescription("Sorry! No streams found with that query")
 			}

		mh.send(msg, embed, options);
		
        }else{
         embed.setDescription("Sorry there was an unexpected connection error, please try again later." );
		mh.send(msg, embed, options);

        }
    })
}
};