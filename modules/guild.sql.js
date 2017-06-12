// toDO: only creator + admins can end polls
const moment = require('moment-timezone');

const nh = require("../data/name_helper.js")
const mh = require("../helper/messages.js")
const ah = require("../helper/arguments.js")
const fh = require("../helper/functions.js")
const dh = require("../helper/db.js")

var guildCache = {}


// database functions

function setupQuery(array){
	var query = "";
	for (var k in array) {
        if (array.hasOwnProperty(k)) {
           query += " "+ k +" = '"+array[k]+ "' AND ";
        }
	}
	return query.substring(0, query.length-4);
}


function getDbData(mysql, table, args, callback) {
var query = "SELECT * FROM "+ table +" WHERE "+ setupQuery(args)
//console.log(query);

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
};


function getUserPermissionGuild(bot, guild, msg, callback){

		  var allowed = 0;
		  var declineTxt = "";
		  var user = msg.author.id
		 // var user = "219009482024419328"

//		  console.log("Permission check 2"+guild)
//		  console.log(bot.guilds.get(guild))
		  
		  var validUser = bot.guilds.get(guild).members.find('id', user)
//		  console.log("Valid"+user+"-->"+validUser)

		  if (validUser  != null ){
		  	 allowed = 1;
		  }else{
			 declineTxt += "It seems to belong to a different guild."
		  }
		  
		callback(allowed, declineTxt);
	//	})
}

function getUserPermission(bot, mysql, pollinfo, msg, type, callback){

		  var userquery = {"channel" : pollinfo[0].channel}
		  userquery[type] = 1
		  var allowed = 0;
		  var declineTxt = "";
		  
		//  getDbData(db, "channels", userquery, function (err, userinfo){
		  
		  var user = msg.author.id
		 // var user = "219009482024419328"
//		  console.log("Permission check")
		  
		  var validUser = bot.channels.get(pollinfo[0].channel).guild.members.find('id', user)
//		  console.log("Valid"+user+"-->"+validUser)

		  if (validUser  != null ){
		  	 allowed = 1;
		  }else{
			 declineTxt += "It seems to belong to a different guild."
		  }
		  // 
		  
		callback(allowed, declineTxt);
	//	})
}


module.exports = (bot, msg, mysql) => {

		var time = moment().add(-24,"hours").unix();    
    
    	
   		if (msg.guild){

    	//console.log(time +"<"+ guildCache[msg.guild.id]);

		if (!guildCache[msg.guild.id] || time > guildCache[msg.guild.id]){
		var members = bot.channels.get(msg.channel.id).guild.members.array()
		var roles = bot.channels.get(msg.channel.id).guild.roles.array()
		var channels = bot.channels.get(msg.channel.id).guild.channels.array()
		
		guildCache[msg.guild.id] = moment().unix()
		
		var queryG = "REPLACE INTO guilds (guildid, guildname, ownername, ownerid) VALUES ('"+msg.guild.id+"', '"+msg.guild.name+"', '"+msg.guild.owner.user.username+"','"+msg.guild.owner.user.id+"');"

				dh.mysqlQuery(mysql, queryG, function(err, all) {
        			if (err) {
         			   console.log(err)
        				};
   	 			});	
		
		channels.forEach(function(channel){				
				var query = "REPLACE INTO guilds_channels (channelid, guildid, channelname, type) VALUES ('"+channel.id+"','"+msg.guild.id+"', '"+channel.name+"', '"+channel.type+"');"
				dh.mysqlQuery(mysql, query, function(err, all) {
        			if (err) {
         			   console.log(err)
        				};
   	 			});			

		})
		
		members.forEach(function(member){				
				var key = member.user.id+"@"+msg.guild.id

				var query = "REPLACE INTO guilds_users (id, guild, userid, username, role) VALUES ('"+key+"','"+msg.guild.id+"', '"+member.user.id+"', '"+member.user.username+"','"+member.highestRole.id+"');"
				dh.mysqlQuery(mysql, query, function(err, all) {
        			if (err) {
         			   console.log(err)
        				};
   	 			});			

		})
		roles.forEach(function(role){
				var key = role.id+"@"+msg.guild.id
				
				var query2 = "REPLACE INTO guilds_roles (id, guild, roleid, rolename) VALUES ('"+key+"','"+msg.guild.id+"', '"+role.id+"', '"+role.name+"');"
				dh.mysqlQuery(mysql, query2, function(err, all) {
        			if (err) {
         			   console.log(err)
        				};
   	 			});		
   	 	})
   	 	}
			//bot.channels.get(msg.channel.id).guild.members.every(function(member){
//		console.log(member.user.username)			
//		})

//    		
//    		dh.mysqlQuery(mysql, query, function(err, all) {
//         	if (err) {
//          	   console.log(err)
//         	};
//         callback(err, all);
//    	 });		
//    		
   		
        	getDbData(mysql, "guilds_users", {guild : msg.guild.id}, function(){
        		
        
        	})
        
        }
};
