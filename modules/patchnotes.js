// TO DO: cache the data and not make an API request every time it's called
// required modules
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var cheerio = require('cheerio');

const nh = require("../helper/names.js")
const mh = require("../helper/messages.js")

var patchUrl = "https://forums.elderscrollsonline.com/en/categories/patch-notes";
var patchPTSUrl = "https://forums.elderscrollsonline.com/en/categories/pts";

// Functions
// need to do async processing through prmoises
function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}

// module returns
module.exports = (bot, msg, options, Discord) => {
var embed = mh.prepare(Discord)

if (options.options.includes("-help")){
    embed.setTitle("Options for " + options.command)
    embed.addField(options.command, "Shows current patchnotes for the live servers")
    embed.addField(options.command + " PTS", "Patchnotes for the PTS (if available)")
    mh.send(msg, embed, options)

}else{
	var url = patchUrl
	if (options.megaservers.includes("PTS")) url =patchPTSUrl
	
    request(url, function(error, response, body) {
        if (error) {
            embed.setDescription("Sorry there was an unexpected connection error, please try again later." );
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
  			titles.push($(element).text().replace(/^ /g, ""));
		});
		
 		var patchOutStickies = []; 
        var patchOutOthers = [];
        
        var lastcurrent = 0;
        for (var i = 0; i < titles.length; i++) {
        	if (stickies[i]){
        		patchOutStickies.push("[" + titles[i] + ']('+list[i]+')');
        	}else{
        		if (lastcurrent < 3){
        			patchOutOthers.push("[" + titles[i] + ']('+list[i]+')');
        			lastcurrent ++;
        		}
        	}
        }
		if (patchOutStickies.length>0){
			embed.setTitle('Current Announcements')		
			embed.setDescription(patchOutStickies)		
			embed.addField('Other recent',patchOutOthers)
		}else{
			embed.setDescription("No announcements available")				
		}		
        }
        mh.send(msg, embed, options)
    });
}
};