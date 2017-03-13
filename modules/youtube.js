module.exports = (bot, msg, twitch,util) => {  
     
   twitch.searchStreams({query: "The+Elder+Scrolls+Online", limit: 10}, function(err, body){
  	  if (err){
    	  console.log(err);
    	} else {
    		var twitchout = "Currently 5 most viewed ESO streams on Twitch.tv are:\n\n"
  	//		msg.channel.sendMessage("Twitching" + util.inspect(body));
  			
  			var maxcount = 5;
 			var curcount = 1;

  			for (var i = 0; curcount <= 5; i++){
  			  	if (body.streams[i]){
  			  		twitchout += curcount + ". **" + JSON.stringify(body.streams[i].channel.display_name).replace(/\"/g, "") + "**: " + "(" + JSON.stringify(body.streams[i].viewers) + ' Viewers): "http://twitch.tv/'+body.streams[i].channel.display_name+'"\n' + JSON.stringify(body.streams[i].channel.status) +'"\n\n';
					curcount++;
				}
  			}
  			
			msg.channel.sendMessage(twitchout);
   	 }});
    
};