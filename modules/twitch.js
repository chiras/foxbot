// v2 ready

const request = require("request");
const mh = require("../helper/messages.js")

module.exports = (bot, msg, clientid, options, Discord) => {  
		var embed = mh.prepare(Discord)
		
        var twitchurl = "https://api.twitch.tv/kraken/streams?game=The%20Elder%20Scrolls%20Online&live=true&language=en&client_id="+clientid;
		
		request({
    		url: twitchurl,
        	json: true
	    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {

			var twitchout = "";
  			var maxcount = 5;
 			var curcount = 1;

  			for (var i = 0; curcount <= 5; i++){
  			  	if (body.streams[i]){
  			  		embed.addField(JSON.stringify(body.streams[i].channel.display_name).replace(/\"/g, "")+ " (" + JSON.stringify(body.streams[i].viewers) + ' Viewers): ' ,"[" + JSON.stringify(body.streams[i].channel.status) + "](http://twitch.tv/"+body.streams[i].channel.display_name+")")
  			  		//twitchout += "\n" + curcount + ". **[" + JSON.stringify(body.streams[i].channel.display_name).replace(/\"/g, "") + "](http://twitch.tv/"+body.streams[i].channel.display_name+")** " + "(" + JSON.stringify(body.streams[i].viewers) + ' Viewers): ' + JSON.stringify(body.streams[i].channel.status) +'\n';
					curcount++;
				}
  			}
		
		mh.send(msg, embed, options);
		
        }else{
         embed.setDescription("Sorry there was an unexpected connection error, please try again later." );
		mh.send(msg, embed, options);

        }
    })
};