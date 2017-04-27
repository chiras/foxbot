const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const nh = require("../data/name_helper.js")


function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}


module.exports = (bot, msg) => {
        
    var args = msg.content.split(",") //.slice(1).join(" ")
    var server = "";   
    
    for (var i = 0; i < args.length; i++) {
    	if(nh.getValidServer(args[i])){
    		server = args[i].replace(/ /g, "");
    		args.splice(i,1);
    		break;
    	}
    }

	if (server == ""){
		    msg.channel.sendEmbed({
                color: 0x800000,
                description: 'Char/Megaserver information missing (EU/NA). Please call e.g. \n**!lb game-character name, EU**\n**!lb @game-account, EU** \n**!lb @game-account, EU, AA, HRC**\n(for specific scores only, options: "'+ nh.getTrialShortnames() +'")  '
 
            });
	}else{
	
	var trialtolook=[];
	
    for (var i = 0; i < args.length; i++) {
    	if(nh.getValidTrials(args[i])){
    		trialtolook.push(args[i].replace(/ /g, ""));
    	}
    }
    
    if (trialtolook.length==0){
    	trialtolook = nh.getTrialShortnames();
    }
    	    
    var name = args[0].split(" ").slice(1).join(" ").replace(/^ /, "").replace(/ $/, "");
   
	var characc = "";
	
	if (name.substring(0,1) == "@"){
		characc = "Account";
	}else{
		characc = "Character";
	}
	
    var baserURL = "https://www.esoleaderboards.com/api/api.php?callType=getScoreBy"+characc+"Name&megaserver="
//    var lbAPI = baserURL + server + "&" + characc + "Name=" + name;
    var lbAPI = [];
    var triallist = [];

    var lbText = "";

   // for (var i = 0; i < 1; i++) {
    for (var j = 0; j < trialtolook.length; j++) {
    	var tmpURL = baserURL + server + "&" + characc.toLowerCase() + "Name=" + name + "&trialIdentifier=" + trialtolook[j];
    	lbAPI.push(tmpURL)
     	triallist.push(trialtolook[j])
    }//}
	
	//console.log(lbAPI)

    var promise = Promise.resolve(3);
    Promise.map(lbAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
            for (var i = 0; i < articles.length; i++) {
                lbText += "* " + nh.linkify(triallist[i])+": "+ articles[i].body +"\n";

            }
            msg.channel.sendEmbed({
                color: 0x800000,
                fields: [{
                    name: "Highest scores for " + name + " on the "+ server+ " megaserver are:",
                    value: lbText
                }],
                footer: {
                    text: 'Data obtained from www.esoleaderboards.com'
                }
            });
        })
        .catch(function(e) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "There was a connection error, please try again later.",
            });
            console.log(e);
        })


	}
};