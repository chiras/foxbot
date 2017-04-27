const moment = require('moment-timezone');
const nh = require("../data/name_helper.js")
const dbh = require("../data/db_helper.js")
//const lfm = require('./modules/lfm.js');

module.exports = (bot, msg, db) => {
var args = msg.content.split(" ").slice(1).join("").split(",")

console.log(args)

var megaserver = ""
var vetnormal = "?"
var role = "?"
var lvlcp = "?"

    for (var i = 0; i < args.length; i++) {
    	console.log(args[i])
    	
    	if(nh.getServer(args[i])){
    		megaserver = nh.getServer(args[i]);
    		//args.splice(i,1);
    		//break;
    	}else if(nh.getGroupMode(args[i])){
    		vetnormal = nh.getGroupMode(args[i]);
    		//args.splice(i,1);
    		//break;
    	}else if(nh.getRole(args[i])){
    		role = nh.getRole(args[i]);
    		//args.splice(i,1);
    		//break;
    	}else if(nh.getCpLvl(args[i])){
    		lvlcp = nh.getCpLvl(args[i]);
    		//args.splice(i,1);
    		//break;
    	}
    }

var searching = args[0];

var search_parameters = {
	"name"		: msg.author.id, 
	"guild"		: msg.guild.name, 
	"megaserver": megaserver, 
	"lvlcp"		: lvlcp, 
	"searching"	: searching, 
	"vetnormal"	: vetnormal, 
	"role"		: role,
	"timepoint"	: moment().unix(), 
	"type"		: "lfg"
	
}

dbh.getDbRecords(db, search_parameters, function(err, all, args) {    
	
	if (all.length > 0){
	console.log(all)
    var lfmtext = "";
    var searching = "";
    
	all.forEach(function(obj) { 
		var time = dbh.getTimeDiff(args["timepoint"], obj.time, "short")
		lfmtext += "\n<@"+obj.name+"> ("+ obj.lvlcp +") of "+obj.guild+" as "+ obj.role +" ("+ time + ")"; 
	});
	
	var lfmtitle = "Others recently searching for a "+ search_parameters["vetnormal"] + " " + args["searching"] + " Group ("+args["megaserver"]+")";
	
	msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : lfmtitle,
  					value : lfmtext
  				}],
			})	 
			
	}
			
});


dbh.getDbInserts(db, search_parameters, function(err, all, args) {    
	if (err){
		console.log(err)
	}else{

	}	
});
 
		msg.channel.sendEmbed({
	  		color: 0x800000,
 	 		description: "<@" + search_parameters["name"] + ">, your request for "+ search_parameters["vetnormal"] + " " + search_parameters["searching"] + " has been added"
		});


};