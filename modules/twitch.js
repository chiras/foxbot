module.exports = (bot, msg, twitch,util) => {  
     
   twitch.searchStreams({query: "The+Elder+Scrolls+Online", limit: 10}, function(err, body){
  	  if (err){
    	  console.log(err);
    	} else {
 	 		var twitchout = "\n\n..................................................................................................."
    		 twitchout += "\n### ** Hot ESO streams online on Twitch.tv are:\n**"
  	//		msg.channel.sendMessage("Twitching" + util.inspect(body));
  			
  			var maxcount = 5;
 			var curcount = 1;

  			for (var i = 0; curcount <= 5; i++){
  			  	if (body.streams[i]){
  			  		twitchout += "\n" + curcount + ". **" + JSON.stringify(body.streams[i].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[i].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[i].channel.display_name+'"\n' + JSON.stringify(body.streams[i].channel.status) +'\n';
					curcount++;
				}
  			}
  			
  			
  	//		twitchout += "1. **" + JSON.stringify(body.streams[0].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[0].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[0].channel.display_name+'"\n' + JSON.stringify(body.streams[0].channel.status) +'"\n\n';
  	//		twitchout += "2. **" + JSON.stringify(body.streams[1].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[1].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[1].channel.display_name+'"\n' + JSON.stringify(body.streams[1].channel.status) +'"\n\n';
  	//		twitchout += "3. **" + JSON.stringify(body.streams[2].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[2].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[2].channel.display_name+'"\n' + JSON.stringify(body.streams[2].channel.status) +'"\n\n';
  	//		twitchout += "4. **" + JSON.stringify(body.streams[3].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[3].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[3].channel.display_name+'"\n' + JSON.stringify(body.streams[3].channel.status) +'"\n\n';
  	//		twitchout += "5. **" + JSON.stringify(body.streams[4].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[4].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[4].channel.display_name+'"\n' + JSON.stringify(body.streams[4].channel.status) +'"\n\n';
  			
 			twitchout += "..................................................................................................."
			msg.channel.sendMessage(twitchout);
   	 }});
    
};