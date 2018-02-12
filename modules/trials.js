// TO DO: cache the data and not make an API request every time it's called
// required modules
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var cheerio = require('cheerio');

const nh = require("../helper/names.js")
const mh = require("../helper/messages.js")

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
    embed.addField(options.command, "Shows the trial of the week for the EU and NA megaserver (if not configured otherwise with **!config**)")
    embed.addField(options.command + " NA", "only for the NA megaserver")
    embed.addField(options.command + " EU", "only for the EU megaserver")
    mh.send(msg, embed, options)

}else{
	// set up the URL based on megaserver
    var baserURL = "https://www.esoleaderboards.com/api/weekly?megaserver="
    var servers = []
    if (options.megaservers.length == 0 || options.megaservers.includes("NA")){
    	servers.push("NA")
    }
    if (options.megaservers.length == 0 || options.megaservers.includes("EU")){
    	servers.push("EU")
    }

    var trialAPI = [baserURL + servers[0], baserURL + servers[1]];

	// set up the content text
    var trialText = "";
    
    // set up the message to the channel
    embed.setAuthor("The Celestial Mage says")//,"http://i.imgur.com/3vEv887.png")
   	embed.setFooter('Data obtained from www.esoleaderboards.com')

	// Promisified requests, have to get data before sending the message to the channel
    var promise = Promise.resolve(3);
    Promise.map(trialAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
        	if (servers.length > 1){
            for (var i = 0; i < servers.length; i++) {
            	// add text for each megaserver
            	// TO DO: use the linkify function in name_helper.js
                trialText += "* " + nh.linkify(articles[i].body) + " (" + servers[i] + ")\n";
            }
    		embed.addField("This week's special trials are",trialText)   
            }else{
            
    		embed.setDescription("This week's special trial for "+servers[0]+" is "+ nh.linkify(articles[0].body))   
            
            }
            // put the text into a field object of the message and send
			mh.send(msg, embed, options);

        })
        .catch(function(e) {
        	// return on error
            embed.setDescription("There was a connection error, please try again later.")
			mh.send(msg, embed, options);
        })
}
};