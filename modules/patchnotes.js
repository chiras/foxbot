module.exports = (bot, msg, request, cheerio) => {
    var patchUrl = "https://forums.elderscrollsonline.com/en/categories/patch-notes";

    request(patchUrl, function(error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
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
  			titles.push($(element).text().replace(/^ /g, ""));
		});
		
 		var patchOutStickies = "\n...................................................................................................\n"
        var patchOutOthers =  patchOutStickies + "### ** Other recent:**\n";
        patchOutStickies +=  "### **Current announcements:**\n";
       
        var lastcurrent = 0;
        for (var i = 0; i < titles.length; i++) {
        	if (stickies[i]){
        		patchOutStickies += "\n" + titles[i] + ':\n<' + list[i] + '>\n';
        	}else{
        		if (lastcurrent < 3){
        			patchOutOthers += "\n" + titles[i] + ':\n<'  + list[i] + '>\n';
        			lastcurrent ++;
        		}
        	}
        }
		
		var patchOut = patchOutStickies + patchOutOthers;
 		patchOut += "..................................................................................................."
		
        msg.channel.sendMessage(patchOut);
           
    });

};