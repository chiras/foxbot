const Promise = require('bluebird');

const _ = require("lodash")
// Set user preferences
const mh = require("../helper/messages.js")
const fh = require("../helper/functions.js")
const ah = require("../helper/arguments.js")
const nh = require("../helper/names.js")
//const gh = require("../helper/guilds.js")
const dh = require("../helper/db.js")

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

x: Bot allowed in every channel?
x: Which members allowed
x: Auto Notification Channel
x:


**/


function setupChoices(array) {
    var txt = "";
    for (var i = 0; i < array.length; i++) {
        txt += i + ": " + array[i] + "\n"
    }
    return txt;
}

function firstCall(Discord, mysql, options, msg, defaultconfigsteps, callback) {
    var embed = mh.prepare(Discord)
    var thisoption = "-help";

    embed.setTitle("Welcome to the configuration")
    embed.setDescription("I will guide you through the complete configuration now step by step. You can also setup now or change later again by calling the options directly.")
    embed.addField("Individual configuration steps are", "\n**!config "+ defaultconfigsteps.join("**\n**!config ")+"**")
    
    embed.addField("Next step will be: ", "!config " + options["settingstodo"][1])

    newGuildConfig(mysql, {
        id: options["settingsid"],
        type: options["settingstype"],
        setting: thisoption,
        value: 1
    }, function() {
        mh.send(msg, embed, options)

        callback(true);

    })

}

function writeSettings(embed, mysql, options, msg, allchoices, mychoices, thisoption, altoption, callback) {

    var va = []
    var validchoices = []
    var pending = thisoption.substring(1, thisoption.length)

    if (options.options[0] == thisoption && mychoices.length > 0) {

        for (var i = 0; i < mychoices.length; i++) {
            if (mychoices[i] >= 0 && mychoices[i] < allchoices.length) {
                va.push(mychoices[i])
            }

        }
        
        if (va.length > 0) {

            clearGuildConfig(mysql, {
                id: options["settingsid"],
                type: options["settingstype"],
                setting: thisoption
            }, function() {
                for (var i = 0; i < va.length; i++) {
                	var sap = null;
	                if (thisoption == "-replytype" && va[i] == "3" && msg.guild) sap = msg.channel.id

                    newGuildConfig(mysql, {
                        id: options["settingsid"],
                        type: options["settingstype"],
                        setting: thisoption,
                        sap: sap,
                        value: va[i]
                    }, function() {

                        callback(true)

                    })
                }

            })

            for (var i = 0; i < va.length; i++) {
                validchoices[i] = allchoices[va[i]]
            }
            embed.setDescription("New Setting, default " + pending + " set to: **" + validchoices.join(", ") + "**")
            mh.send(msg, embed, options)


        } else if (validchoices.length == 0) {
            embed.addField("Error:", "No valid choice has been provided.")
            mh.send(msg, embed, options)
            callback(false)
        }

    } else {
        if (embed.Description) {
            embed.setDescription("Please select which one is your default " + thisoption.substring(1, thisoption.length) + ". You will not need to specify this anymore in some commands, but you are still able to provide an alternative with the command.")
        }
        embed.addField("Possible choices:", setupChoices(allchoices))

        if (msg.guild) {
            embed.addField("Setup the " + pending + " for the complete guild:", "**!config " + thisoption + altoption)
            embed.addField("Setup the " + pending + " for this channel only:", "**!config -channel " + thisoption + altoption.replace(/\n.*$/g, "") + "")
            embed.addField("Setup the " + pending + " for me only, but everywhere:", "**!config -me " + thisoption + altoption.replace(/\n.*$/g, "") + "")
        } else {
            embed.addField("Setup the " + pending + " for my direct messages:", "**!config " + thisoption + altoption.replace(/\n.*$/g, "") + "")
        }

        mh.send(msg, embed, options)
        callback(false)
    }

}

const reply_types = ["In the same channel", "Direct Message to the user", "All guild-wide requests will be answered in current channel (switch and continue config in another channel if wanted there)"]

function setReplyTxt(Discord, mysql, options, msg, callback) {
    var embed = mh.prepare(Discord)
    embed.setTitle("Reply Type configuration")

    var thisoption = "-replytype";
    var allchoices = ["no default"].concat(reply_types)
    var mychoices = [...options.value_num]

    writeSettings(embed, mysql, options, msg, allchoices, mychoices, thisoption, " 1**", function(proceed) {
        callback(proceed);
    })

}


function setBlacklistX(Discord, mysql, options, msg, allowDeny,  callback) {

    var embed = mh.prepare(Discord)
    embed.setTitle("Blacklisting configuration")

    var thisoption = "-" + allowDeny;
    var mychoices = [...options.others]
    var myrole = []
    var myrolename = []

    dh.getDbData(mysql, "guilds_roles", {
        guild: options["settingsid"]
    }, function(all) {

        for (var k = 0; k < all.length; k++) {
        
            if (options.value_num.length == 0) {
                myrole.push(all[k].roleid)
            	myrolename.push(all[k].rolename.replace(/^\@/,""))
            }
            if (options.value_num.length > 0 && options.value_num.includes(k)) {
            		myrole.push(all[k].roleid)
            	    myrolename.push(all[k].rolename.replace(/^\@/,""))
            	}

        }

        for (var i = 0; i < mychoices.length; i++) {
            if (mychoices[i].startsWith("!")) {
                mychoices[i] = mychoices[i].substring(1, mychoices[i].length)
            }
            if (mychoices[i] != "config") {

                if (thisoption == "-allow") {                	
                    for (var k = 0; k < myrole.length; k++) {
                        clearGuildConfig(mysql, {
                            id: options["settingsid"],
                            setting: "-deny",
                            value: mychoices[i]
                            }, function() {
                            callback(false)
                        })
                    }
                }

                if (thisoption == "-deny") {
                    for (var k = 0; k < myrole.length; k++) {
                        newGuildConfig(mysql, {
                            id: options["settingsid"],
                            setting: "-deny",
                            value: mychoices[i],
                            sap: myrole[k]
                        }, function() {
                            callback(false)
                        })

                    }
                }

            }
        }
    	embed.setDescription("Blacklisting changed to **"+allowDeny+"** of **" + mychoices.join(", ")+"** for roles: "+ myrolename.join(", "))
	    mh.send(msg, embed, options) 
    })

}

function subDel(query1, mysql) {
    return new Promise((resolve) => {
//	    console.log(query1)

    	dh.mysqlQuery(mysql, query1, function(err,all) {
    		resolve(all)
    	})
    
    })
}

function setSubscribeX(Discord, mysql, options, msg, subUnsub,  callback) {

    var embed = mh.prepare(Discord)
    embed.setTitle("Subscription configuration")

    var thisoption = "-" + subUnsub;
    var mychoices = [1,2,3]
    if (options.value_num.length > 0) mychoices = [...options.value_num]

    	//console.log(mychoices)
    	
    	
        var promises = [];

	    for (var i = 0; i < mychoices.length; i++) {
        	var query1 = "DELETE FROM guilds_settings WHERE settingsid = '" + options["settingsid"] + "' AND settingstype = '" + options["settingstype"] + "' AND setting = '-sub' AND value = '"+mychoices[i]+"'";
                promises.push(subDel(query1, mysql))
        }

        Promise.all(promises).then(values => {
 	    for (var i = 0; i < mychoices.length; i++) {
   			if (options.options.includes("-sub")) {
    		var query2 = "INSERT into guilds_settings (settingsid, settingstype, setting, value) VALUES ('" + options["settingsid"] + "','" + options["settingstype"] + "','" + "-sub" + "','" + mychoices[i] + "')";
	    		//console.log(query2)
	   			dh.mysqlQuery(mysql, query2, function(err,all) {
    	    		return(all)
			    });
			    }
			}

        }).then(function(){
        	callback(false)
        })  	

    	embed.setDescription("Subscription changed to **"+subUnsub+"** of **" + mychoices.join(", ")+"**")
	    mh.send(msg, embed, options) 

}

function setBlacklist(Discord, mysql, options, msg,  callback) {
    dh.getDbData(mysql, "guilds_roles", {
        guild: msg.guild.id
    }, function(all) {
        var roles = [];
        //console.log(all)

        for (var i = 0; i < all.length; i++) {
            roles.push(all[i]["rolename"].replace(/^\@/, ""))
        }

        var embed = mh.prepare(Discord)
        embed.setTitle("Role configuration")

        var thisoption = "-blacklist";
        var allchoices = roles;
        //console.log(roles)
        var mychoices = [...options.value_num]
        var embed = mh.prepare(Discord)

        embed.setDescription("If you want to regulate how your members can use specific commands or blacklist words where the bot responds in general, you can do this here. Forbid or allow for members that have the following role as **highest** role as follows. Default is that everybody is allowed to use every command.")

        var validchoices = []
        var pending = thisoption.substring(1, thisoption.length)

        embed.addField("Possible choices:", setupChoices(allchoices))

        if (msg.guild) {
            embed.addField("Setup the blacklisting for every channel:", "**!config -deny !roll, !doll, !price**\n**!config -allow !price**")
            embed.addField("Setup rules for this channel/me only:", "**!config -deny -channel !roll**\n**!config -deny -me !youtube**")
            embed.addField("Setup these for specific guild roles:", "**!config -deny 1,2 !poll**\n**!config -allow 1,2,3 !vote**")
            embed.addField("To continue without changes with the configuration:", "**!config**")
        } else {
            embed.addField("Setup the blacklisting for my direct messages:", "**!config -forbid !youtube**")
        }

        newGuildConfig(mysql, {
            id: options["settingsid"],
            type: options["settingstype"],
            setting: thisoption,
            value: 1
        }, function() {
            mh.send(msg, embed, options)
            callback(false);
        })

    })
}

function setSubscription(Discord, mysql, options, msg,  callback) {

        var thisoption = "-subscription";
        var allchoices = ["Latest ESO news --> 2-3x notifications each week", "Regular Events (realm status change, dailies, weeklies, weekend vendors) --> 1-2x daily ","Major bot updates (e.g. new commands available) --> 1-2x notifications per month"];
        var mychoices = [...options.value_num]
        var embed = mh.prepare(Discord)
    	embed.setTitle("Subscription configuration")

        embed.setDescription("It is possible to be automatically and directly notified in a specified channel or you as a direct message by making a subscription. Go to your desired channel for this, or switch to direct message to the bot and subscribe to one or more of the possible choices:")

        var validchoices = []
        
        embed.addField("Possible choices:", setupChoices(allchoices))

        if (msg.guild) {
            embed.addField("Subscribe/Unsubscribe for a channel:", "**!config -sub 1,2,3**\n**!config -unsub 3**")
            embed.addField("Setup subscription for me only:", "**!config -sub -me 1,3 **\n**or just in a direct message to the bot**")
        } else {
            embed.addField("Setup subscription for me only:", "**!config -sub 1,2,3**\n**!config -unsub 3**")
        }

        newGuildConfig(mysql, {
            id: options["settingsid"],
            type: options["settingstype"],
            setting: thisoption,
            value: 1
        }, function() {
            mh.send(msg, embed, options)
            callback(false);
        })
}


function setMegaserverTxt(Discord, mysql, options, msg, callback) {
    var embed = mh.prepare(Discord)
    embed.setTitle("Megaserver configuration")

    var thisoption = "-megaserver";
    var allchoices = ["no default"].concat(Object.keys(nh.listServers()))
    //	allchoices = allchoices.map(function(x){ return x.toUpperCase()})

    var mychoices = [...options.value_num]

    writeSettings(embed, mysql, options, msg, allchoices, mychoices, thisoption,  " 1**", function(proceed) {
        callback(proceed);
    })
}

function clearGuildConfig(mysql, args, callback) {
    var query = "DELETE FROM guilds_settings WHERE settingsid = '" + args["id"] + "' AND settingstype = '" + args["type"] + "' AND setting = '" + args["setting"] + "'";
    //console.log(query)
    if (args["value"]) {
        query += " AND value = '" + args["value"] + "'"
    }
	if (args["sap"]) {
        query += " AND sap = '" + args["sap"] + "'"
    }
    dh.mysqlQuery(mysql, query, function(all) {
        callback(all)
    });
};

function newGuildConfig(mysql, args, callback) {
    var query = "INSERT into guilds_settings (settingsid, settingstype, setting, value) VALUES ('" + args["id"] + "','" + args["type"] + "','" + args["setting"] + "','" + args["value"] + "')";
	if (args["sap"]) {
    	 query = "INSERT into guilds_settings (settingsid, settingstype, setting, value, sap) VALUES ('" + args["id"] + "','" + args["type"] + "','" + args["setting"] + "','" + args["value"] + "','" + args["sap"] + "')";
    }
    //console.log(query)
    dh.mysqlQuery(mysql, query, function(all) {
        callback(all)
    });
};


module.exports = (bot, msg, options, mysql, Discord) => {

    var allconfigsteps = {
        "-help": function(callback) {firstCall(Discord, mysql, options, msg, defaultconfigsteps, function(proceed) {callback(proceed)})},
        "-megaserver": function(callback) {setMegaserverTxt(Discord, mysql, options, msg, function(proceed) {callback(proceed)})},
        "-replytype": function(callback) {setReplyTxt(Discord, mysql, options, msg,  function(proceed) {callback(proceed)})},
        "-blacklist": function(callback) {setBlacklist(Discord, mysql, options, msg, function(proceed) {callback(proceed)})},
        "-deny": function(callback) {setBlacklistX(Discord, mysql, options, msg, "deny",  function(proceed) {callback(proceed)})},
        "-allow": function(callback) {setBlacklistX(Discord, mysql, options, msg, "allow",  function(proceed) {callback(proceed)})},
        "-subscription": function(callback) {setSubscription(Discord, mysql, options, msg, function(proceed) {callback(proceed)})},
        "-sub": function(callback) {setSubscribeX(Discord, mysql, options, msg, "sub",  function(proceed) {callback(proceed)})},
        "-unsub": function(callback) {setSubscribeX(Discord, mysql, options, msg, "unsub",  function(proceed) {callback(proceed)})},
    }

    var guildconfigstep = [];
    var guildconfigstepall = Object.keys(allconfigsteps);


    if (msg.guild) {
        options["settingsid"] = msg.guild.id
        options["settingstype"] = "guild"
    }

    if (options.options.includes("-channel") || options.options.includes("-sub") || options.options.includes("-unsub")) {
        options["settingsid"] = msg.channel.id
        options["settingstype"] = "channel"
    }

    if (options.options.includes("-me") ||  !msg.guild) {
        options["settingsid"] = msg.author.id
        options["settingstype"] = "user"
        fh.removeElement(guildconfigstepall, "-blacklist")
        fh.removeElement(guildconfigstepall, "-replytype")
    }

    fh.removeElement(guildconfigstepall, "-deny")
    fh.removeElement(guildconfigstepall, "-allow")
    fh.removeElement(guildconfigstepall, "-sub")
    fh.removeElement(guildconfigstepall, "-unsub")
    
    var defaultconfigsteps = [...guildconfigstepall];

    dh.getDbData(mysql, "guilds_settings", {
        settingsid: options["settingsid"]
    }, function(configsteps) {
    	
    	var done = {}

        //console.log("setting start: " + guildconfigstepall.join(","))

        for (var i = 0; i < configsteps.length; i++) {
            fh.removeElement(guildconfigstepall, configsteps[i].setting)
            if (!done[configsteps[i].setting]){
            	done[configsteps[i].setting] = []
            }
            done[configsteps[i].setting].push(configsteps[i].value)
        }

        if (options.options.length == 0) {
            guildconfigstep = guildconfigstepall[0]
        } else {
            guildconfigstep = options.options[0]
        }

        options["settingstodo"] = [...guildconfigstepall]

        //console.log("setting unconfigs: " + options["settingstodo"].join(","))
        //console.log("setting doing: " + guildconfigstep)

        if (allconfigsteps[guildconfigstep]) {
            allconfigsteps[guildconfigstep](function(proceed) {

                for (var i = 0; i < guildconfigstepall.length; i++) {
                    fh.removeElement(guildconfigstepall, guildconfigstep)
                }
                //console.log("setting next: " + options["settingstodo"][0])

                if (proceed) {
                    if (guildconfigstepall.length > 0 && allconfigsteps[guildconfigstepall[0]]) {
                        allconfigsteps[guildconfigstepall[0]](function(proceed) {});
                    } else {
                        var embed = mh.prepare(Discord)
                        embed.addField("Configuration complete", "Done")
                        mh.send(msg, embed, options)
                    }
                }
            });
        }else if(guildconfigstepall.length == 0){
                var embed = mh.prepare(Discord)
                embed.addField("Configuration has been completed", "To reconfigure individual steps call: \n**!config "+ defaultconfigsteps.join("**\n**!config ")+"**")//\n\nCurrent config:")
         //       embed.addField("Megaserver", ["no default"].concat(Object.keys(nh.listServers()))[done["-megaserver"]])
         //       embed.addField("Reply Type", ["no default"].concat(Object.keys(nh.listServers()))[done["-megaserver"]])

                mh.send(msg, embed, options)        
        }else{
        // configuration option not identified
                var embed = mh.prepare(Discord)
                embed.addField("Configuration step not identified", "To continue a configuration: \n\n **!config** \n\nor to configure individual steps call: \n**!config "+ defaultconfigsteps.join("**\n**!config ")+"**")
                mh.send(msg, embed, options)        

        }

    })
};