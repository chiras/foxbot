// use urlencode not hardcode whitespaces
// morrowind trials

const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const nh = require("../helper/names.js")
const mh = require("../helper/messages.js")


function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}

function getHelp(embed, options){
    embed.setTitle("Options for " + options.command)
    embed.setDescription("Arguments for account/character and megaserver (only EU/NA) are required.")
    embed.addField(options.command + " $account EU", "Shows all scores for this account on the EU megaserver")
    embed.addField(options.command + " character NA", "Shows all scores for this character on the NA megaserver")
    embed.addField(options.command + " $account EU DSA, MSA, trials", "Shows scores only for these specific instances. \nValid single instance options are: '"+ nh.getInstances("lbAll").join(', ').toUpperCase() +"'\nValid combinatory options '"+ nh.getInstances("lbOptions").join(', ') + "'")
	return embed
}

var helptit = "Options for !lb"
var helptxt = 'Please call e.g. \n**!lb game-character name, EU**\n**!lb $game-account, EU** \n**!lb $game-account, EU, AA, HRC**\n(for specific scores only, '


module.exports = (bot, msg, options, Discord) => {
var embed = mh.prepare(Discord)

if (options.options == "!help"){

	embed = getHelp(embed, options)
	mh.send(msg, embed, options)

}else{

	if (options.megaservers.length == 0 || (options.accounts.length == 0 && options.others.length == 0) || !["EU","NA","eu","na"].includes(options.megaservers[0])){
			embed = getHelp(embed, options)
		//	embed.addField("Char/Megaserver information missing (EU/NA)", "please provide this information to proceed.")
        	mh.send(msg,embed, options)
	}else{
	
	var trialtolook= [];
	
	if (options.instance.length== 0){
			trialtolook= nh.getInstances("lbAll");
		}else{
			trialtolook= options.instance;
		}
   
	var characc = "Account";
	var nameorg = "";
	
	if (options.accounts.length > 0){
		nameorg = "@" + options.accounts[0].replace(/\$/g, "")		
	}else{
		nameorg = options.others.join(" ");
		if (!nameorg.startsWith("@")) characc = "Character";
	}
	
	name = encodeURI(nameorg)
	
    var baserURL = "https://www.esoleaderboards.com/api/score/character?megaserver="

    var lbAPI = [];
    var triallist = [];

    var lbText = "";

    for (var j = 0; j < trialtolook.length; j++) {
    	var tmpURL = baserURL + options.megaservers[0] + "&" + characc.toLowerCase() + "Name=" + name + "&trialIdentifier=" + trialtolook[j].toUpperCase();
    	lbAPI.push(tmpURL)
     	triallist.push(trialtolook[j])
    }//}
	
//	console.log(lbAPI)

    var promise = Promise.resolve(3);
    Promise.map(lbAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
            for (var i = 0; i < articles.length; i++) {
            //    lbText += "* " + nh.linkify(triallist[i])+": "+ articles[i].body +"\n";
                lbText += "* **" + nh.getLongName(triallist[i])+"**: "+ articles[i].body +"\n";

            }
            embed.addField("Highest scores for " + nameorg + " on the "+ options.megaservers[0]+ " megaserver are:", lbText)
            embed.setFooter('Data obtained from www.esoleaderboards.com')
            
        }).then(function() {
        	mh.send(msg,embed, options)
        }).catch(function(e) {
            embed.setDescription("There was a connection error, please try again later.")
        	mh.send(msg,embed, options)
            console.log(e);
        })


	}
}

};