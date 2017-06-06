// TO DO: cache the data and not make an API request every time it's called
// required modules
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));


// Functions
// need to do async processing through prmoises
function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}

// Data 
// TO DO: should be relocated to name_helper.js/external json some time
const baseurluesp = "http://en.uesp.net"

const trials = {
    "Aetherian Archive": "/wiki/Online:Aetherian_Archive",
    "Hel Ra Citadel": "/wiki/Online:Hel_Ra_Citadel",
    "Sanctum Ophidia": "/wiki/Online:Sanctum_Ophidia",
    "Maw of Lorkhaj": "/wiki/Online:Maw_of_Lorkhaj",
 //   "Halls of Fabrication": "/wiki/Online:Maelstrom_Arena_(place)",
    "Dragonstar Arena (Veteran)": "/wiki/Online:Dragonstar_Arena",
    "Maelstrom Arena (Veteran)": "/wiki/Online:Maelstrom_Arena_(place)"
};


// module returns
module.exports = (bot, msg, request, cheerio, util, Discord) => {

	// set up the URL based on megaserver
    var baserURL = "https://www.esoleaderboards.com/api/api.php?callType=getWeeklyTrial&megaserver="
    var servers = ["EU", "NA"]
    var trialAPI = [baserURL + servers[0], baserURL + servers[1]];

	// set up the content text
    var trialText = "";
    
    // set up the message to the channel
	var embed = new Discord.RichEmbed()
    embed.setAuthor("The Celestial Mage says")//,"http://i.imgur.com/3vEv887.png")
    embed.setColor(0x800000)
   	embed.setFooter('Data obtained from www.esoleaderboards.com')

	// Promisified requests, have to get data before sending the message to the channel
    var promise = Promise.resolve(3);
    Promise.map(trialAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
            for (var i = 0; i < 2; i++) {
            	// add text for each megaserver
            	// TO DO: use the linkify function in name_helper.js
                trialText += "* [" + articles[i].body + "](" + baseurluesp + trials[articles[i].body] + ") (" + servers[i] + ")\n";
            }
            
            // put the text into a field object of the message and send
    		embed.addField("This week's special trials are",trialText)
			msg.channel.sendEmbed(embed);

        })
        .catch(function(e) {
        	// return on error
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "There was a connection error, please try again later.",
            });
        })

};