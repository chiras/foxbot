var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}
var baseurluesp = "http://en.uesp.net"

var trials = {
    "Aetherian Archive": "/wiki/Online:Aetherian_Archive",
    "Hel Ra Citadel": "/wiki/Online:Hel_Ra_Citadel",
    "Sanctum Ophidia": "/wiki/Online:Sanctum_Ophidia",
    "Maw of Lorkhaj": "/wiki/Online:Maw_of_Lorkhaj",
    "Dragonstar Arena (Veteran)": "/wiki/Online:Dragonstar_Arena",
    "Maelstrom Arena (Veteran)": "/wiki/Online:Maelstrom_Arena",
};

var trialsshort = {
    "AA": "Aetherian Archive",
    "HRC": "Hel Ra Citadel",
    "SO": "Sanctum Ophidia",
    "MOL": "Maw of Lorkhaj",
    "DSA": "Dragonstar Arena (Veteran)",
    "MSA": "Maelstrom Arena (Veteran)",
};

module.exports = (bot, msg) => {
    
    var args = msg.content.split(",") //.slice(1).join(" ")
    var server = "";   
    var servers = {"EU" : "EU" ,"NA" : "NA"}
    
    for (var i = 0; i < args.length; i++) {
    	if(servers[args[i].replace(/ /g, "")]){
    		server = args[i].replace(/ /g, "");
    		args.splice(i,1);
    		break;
    	}
    }

	var trialtolook=[];
	
    for (var i = 0; i < args.length; i++) {
    	if(trialsshort[args[i].replace(/ /g, "")]){
    		trialtolook.push(args[i].replace(/ /g, ""));
    	}
    }
    
    if (trialtolook.length==0){
    	trialtolook = Object.keys(trialsshort);
    }
    	
	if (server == ""){
		    msg.channel.sendEmbed({
                color: 0x800000,
                description: 'Char/Megaserver information missing (EU/NA). Please call e.g. \n**!lb character name, EU**\n**!lb @account, EU** \n**!lb @account, EU, AA, HRC**\n(for specific scores only, options: "'+ Object.keys(trialsshort).join(", ") +'")  '
 
            });
	}else{
    
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
                lbText += "* [" + trialsshort[triallist[i]] + "](" + baseurluesp + trials[trialsshort[triallist[i]]] + "): "+ articles[i].body +"\n";

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
        })


	}
};