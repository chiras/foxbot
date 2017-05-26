// Set user preferences
const sqlite3 = require('sqlite3').verbose();

const mh = require("../helper/messages.js")
const ah = require("../helper/arguments.js")
const nh = require("../helper/names.js")
const gh = require("../helper/guilds.js")

var db = new sqlite3.Database('./data/dbs/guilds.db');

/** 
#### user: = direct messages
- length: normal, short, lore
- account name
- default/all characters
- default/all megaserver
- notifications: all, bot, news, regulars

#### guilds: all channels



#### guilds: all channels

- length: normal, short, lore
	--> msgtype = 1 : short, 2: normal, 3: lore
	
- permissions: per role or perm?, per command

#### channels: 

- permissions: per role, per command
- notifications: all, bot, news, regulars

guild, channel, 

**/ 

/**
QUESTIONAIRE:
0: Megaserver
1: Responses in channel

x: Bot allowed in every channel?
x: Which members allowed
x: Auto Notification Channel
x:


**/

function getGuildConfigStep(db, table, arg, callback) {
db.serialize(function() {
    db.all("SELECT * FROM "+ table +" WHERE guild IS '"+ arg+"'", function(err, all) {
        if (err) {
            console.log(err)
        };
             console.log(all)
        callback(err, all);
    });
});
};

const reply_types = {	1 : "In the same channel",
						2 : "Direct Message to the user",
						3 : "Direct Message and auto-delete the request (requires bot permission to 'Manage Messages')"
}

function setRoleTxt(embed, roles){
	        		console.log(roles)
					var replytxt = "";
        			
        			for (var i = 0; i < Object.keys(roles).length;i++){
        				replytxt += i+": " + roles[Object.keys(roles)[i]]+"\n"
        			}   
        			embed.addField("Step 3: Role Management","Which user groups do you want to be able to use the bot")        			
        			embed.addField("Possible choices:",replytxt)        			
        			embed.addField("Allow groups specific commands:","**!config -allow 1,2 !pledges**")    
        			embed.addField("Forbid groups specific commands:","**!config -allow 1,3 !polls **")    
				return embed;
}


function setReplyTxt(embed){
					var replytxt = "";
        			var i = 0;
        			for (var reply in reply_types){
        				i++;
        				replytxt += i+": " + reply_types[reply]+"\n"
        			}        			
        			embed.addField("Step 2: Bot reply","How do you want users to receive their bot reply?")        			
        			embed.addField("Possible choices:",replytxt)        			
        			embed.addField("Setup the reply type by using e.g.:","**!config -reply 1**")    
				return embed;
}

function setMegaserverTxt(embed){
        			var servers = nh.listServers();
        			var servertxt = "0: no default\n";
        			var i = 0;
        			for (var server in servers){
        				i++;
        				servertxt += i+": " + servers[server]+"\n"
        			}
        			embed.addField("Step 1: Megaserver configuration","Please select which one is your default server. You will not need to specify this anymore in some commands, e.g. leaderboards and lfg")        			
        			embed.addField("Possible choices:",servertxt)        			
        			embed.addField("Setup the megaserver by using e.g.:","**!config -megaserver 1**")    
				return embed;
}


function newGuildConfig(db, args, callback) {
	db.each("INSERT OR REPLACE into settings (guild) VALUES ('"+args+"')", function(err, row) {
		if (err){
			console.log(err)
		}else{

		}	
	});
}; 

function setGuildConfigStep(db, args, callback) {
	var query = "UPDATE settings SET '"+args[1]+"' = '"+args[2]+ "' WHERE guild = '"+args[0]+"'";
	db.each(query, function(err, row) {
		if (err){
			console.log(err + "\n\n"+query)
		}else{

		}	
	});
}; 

function guildConfiguration(db, msg, embed, callback){
	getGuildConfigStep(db, "settings", msg.channel.guild.id, function(err, configstep){
		if (configstep.length!=0){
		if (nh.getServer(configstep[0].megaserver)){
			console.log("Megaserver has already been set")
			if (configstep[0].reply_type){
				console.log("Reply Type has already been set")

				getGuildConfigStep(db, "channels", msg.channel.guild.id, function(err, channels){
  				console.log(channels)
	        	console.log(gh.getGuildRoles(msg))

					if ("Here check roles" == "not yet done"){
						console.log("Roles have already been set")		
					
					}else{ // roles
	        			console.log("Step 3: required" )
						gh.getGuildRoles(msg, function(roles){
	    	    			embed = setRoleTxt(embed, roles);			
		        			console.log(roles)	        			
						
						}) //this might need a callback
					}
				})
				
			}else{ // reply type
	        	console.log("Step 2: required" )
    	    	embed = setReplyTxt(embed);			
			}
		}else{ // megaserver
        	console.log("Step 1: required" )
        	embed = setMegaserverTxt(embed);			
		}
		
		console.log("No valid configuration step provided")	
		
		}else{	
			console.log("starting new config")	
    		embed = setMegaserverTxt(embed);
			newGuildConfig(db, msg.channel.guild.id, function(){})			
		}
		callback(embed)
	})

}



module.exports = (bot, msg, Discord) => {
	var embed = mh.prepare(Discord)
	ah.argumentSlicer(msg.content, function(options){
	
			switch(options.options[0]) {
    			case "-megaserver":
        			console.log("Setup 1:" )
        			if (options.value_num.length!=0){
        				servers = nh.listServers()       			
	        			setGuildConfigStep(db, [msg.channel.guild.id, "megaserver",Object.keys(servers)[options.value_num[0]-1]])
						embed.addField("New Setting:","Default megaserver has been set to " + servers[Object.keys(servers)[options.value_num[0]-1]])
        			}else{
            			embed = setMegaserverTxt(embed);			
        			}			
        		break;
    			case "-reply":
        			console.log("Setup 2:")
        			if (options.value_num.length!=0){
	        			setGuildConfigStep(db, [msg.channel.guild.id, "reply_type",options.value_num[0]])
						embed.addField("New Setting:","Default reply type has been set to '" + reply_types[options.value_num[0]]+"'")
        			}else{
            			embed = setMegaserverTxt(embed);			
        			}			

        		break;
    			default:
        			console.log("No valid configuration step provided")
			}
			
		console.log(options)
		guildConfiguration(db, msg, embed,function(){
		
			mh.send(msg.channel,embed)
		
		})

	})
};