const moment = require('moment-timezone');
var Promise = require('promise');
const nh = require("../data/name_helper.js")
const dbh = require("../data/db_helper.js")


const valid_searches = {
	"trials" : "Trials",
	"trial" : "Trials",
	"random trial" : "Trials",
	"dungeons" : "Dungeons",
	"dungeon" : "Dungeons",
	"random dungeon" : "Dungeons"
	}   

module.exports = (bot, msg, db, lfmtext) => {

var timepoint = moment().unix();
args = msg.content.split(" ").slice(1).join(",").split(",")

var server="";

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
                description: 'Megaserver information missing (EU/NA). Please call e.g. \n**!lfm EU, trials, AA, HRC, 2h **\noptions komma separated: \n * Trials: trials, "'+ nh.getTrialShortnames() +'"\n * Dungeons: dungeons  '
 
            });
}else{

//var args = msg.content.replace(/\"/g, "").split(",") //.slice(1).join(" ")

var searches = [];

for (var i = 0; i < args.length; i++) {
    if (valid_searches[args[i]]){
    		searches.push(valid_searches[args[i]]);
    }
}

console.log(searches)
var filter; 

for (var i = 0; i < searches.length; i++) {

//filter = searches[i];

dbh.getDbRecords(db, searches[i], server, timepoint,lfmtext, bot, function(err, all, filter, server) {    
	
	if (all.length > 0){
	console.log(all)
    var lfmtext = "";
    var searching = "";
    
	all.forEach(function(obj) { 
		var time = dbh.getTimeDiff(timepoint, obj.time, "short")
		lfmtext += "\n<@"+obj.name+"> of "+obj.guild+" ("+ time + ")"; 
	});
	
	var lfmtitle = "Recent searches for " + filter + " Groups ("+server+")";
	
	msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : lfmtitle,
  					value : lfmtext
  				}],
			})	 
			
	}else{
		msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : lfmtitle,
  					value : "Sorry, no entries at the moment"
  				}],
			})	 	
	}
			
});


}};

};
