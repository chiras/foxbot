module.exports = (bot, msg, request, cheerio) => {
console.log("PTS")
    var patchPTSUrl = "https://forums.elderscrollsonline.com/en/categories/pts";

    request(patchPTSUrl, function(error, response, body) {
        if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );
            console.log("Error: " + error);
        }else{
        var $statusbin = 0;
        if (response.statusCode === 200) {
            var $ = cheerio.load(body);
        }
		var stickies = [];      
		var list = [];
		var titles = [];
		$('td[class="DiscussionName"]').find('td > div > a').each(function (index, element) {
			if ($(this).parent().find('.px-pinned').length == 1){
				stickies.push(1);
			}else{
				stickies.push(0);
			}
  			list.push($(element).attr('href'));
  			titles.push($(element).text().replace(/^ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\[/g, "").replace(/\]/g, ""));
		});
// 		
  		var patchPTSOutStickies = "\n"; //"\n...................................................................................................\n"
         var patchPTSOutOthers = "\n";// patchPTSOutStickies + "### ** Other recent:**\n";
       //  patchPTSOutStickies +=  "### **Current announcements:**\n";
//        
        var lastcurrent = 0;
    	var scount = 0;
    	var ncount = 0;
        for (var i = 0; i < titles.length; i++) {
        	if (stickies[i]){
        		scount++
        		if (scount < 6){
        			patchPTSOutStickies += "\n[" + titles[i] + ']('+list[i]+')\n';
        			}
        	}else{
        		if (lastcurrent < 3){
        			ncount++
        			if (ncount < 6){
        				patchPTSOutOthers += "\n[" + titles[i] + ']('+list[i]+')\n';
        			}
        			lastcurrent ++;
        		}
        	}
        }
		
// 		var patchPTSOut = patchPTSOutStickies + patchPTSOutOthers;
//  		//patchPTSOut += "..................................................................................................."
// 		
  //      msg.channel.sendMessage(patchPTSOut);
        console.log(patchPTSOutStickies)
        msg.channel.sendEmbed({
  			color: 0x800000,
  		//	description: helpinfo,
  			fields: [{
       			 name: 'Current Announcements',
       			 value: patchPTSOutStickies
     		 }]
		});

        msg.channel.sendEmbed({
  			color: 0x800000,
  		//	description: helpinfo,
  			fields: [
     		 {
       			 name: 'Other recent',
       			 value: patchPTSOutOthers
			}
    		]
		});
		
        }
    });

};