const Promise = require('bluebird');

const _ = require("lodash")
// Set user preferences
const mh = require("../helper/messages.js")
const fh = require("../helper/functions.js")
const ah = require("../helper/arguments.js")
const nh = require("../helper/names.js")
const dh = require("../helper/db.js")
const zone = require("../helper/timezone.js")

var terms = {
    "-megaserver": ["no default"].concat(Object.keys(nh.listServers())),
    "-replytype": ["In the same channel", "Direct Message to the user", "All guild-wide requests will be answered in current channel (switch and continue config in another channel if wanted there)"],
    "-subscription": ["Latest ESO news (2-3x notifications each week)\n   -> Patch Notes, Hotfixes, new DLC announcements etc.", "Regular Events (1-3x daily)\n   ->  Realm status change, new Pledges/Trials, Weekend Vendors stocks)", "Major bot updates (0-2x per month)\n   ->  new commands, major changes"],
    "-sub": ["Latest ESO news", "Regular Events", "Major bot updates"]
}

function setupChoices(array) {
    var txt = "";
    for (var i = 0; i < array.length; i++) {
        txt += i + ": " + array[i] + "\n"
    }
    return txt;
}

// function firstCall(Discord, mysql, options, msg, defaultconfigsteps, callback) {
//     var embed = mh.prepare(Discord)
//     var thisoption = "-help";
// 
//     embed.setTitle("Welcome to the configuration")
//     embed.setDescription("I will guide you through the complete configuration now step by step. You can also setup now or change later again by calling the options directly.")
//     embed.addField("Individual configuration steps are", "\n**!config " + defaultconfigsteps.join("**\n**!config ") + "**")
// 
//     embed.addField("Next step will be: ", "!config " + options["settingstodo"][1])
// 
//     newGuildConfig(mysql, {
//         id: options["settingsid"],
//         type: options["settingstype"],
//         setting: thisoption,
//         value: 1
//     }, function() {
//         mh.send(msg, embed, options)
// 
//         callback(true);
// 
//     })
// 
// }

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
                    if (thisoption == "-replytype" && va[i] == "2" && msg.guild) sap = msg.channel.id

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
            //     embed.addField("Setup the " + pending + " for this channel only:", "**!config -channel " + thisoption + altoption.replace(/\n.*$/g, "") + "")
            //     embed.addField("Setup the " + pending + " for me only, but everywhere:", "**!config -me " + thisoption + altoption.replace(/\n.*$/g, "") + "")
        } else {
            embed.addField("Setup the " + pending + " for my direct messages:", "**!config " + thisoption + altoption.replace(/\n.*$/g, "") + "")
        }

        mh.send(msg, embed, options)
        callback(false)
    }

}

function setReplyTxt(Discord, mysql, options, msg, callback) {
    var embed = mh.prepare(Discord)
    embed.setTitle("Reply Type configuration")

    var thisoption = "-replytype";
    var mychoices = [...options.value_num]

    writeSettings(embed, mysql, options, msg, terms[thisoption], mychoices, thisoption, " 1**", function(proceed) {
        callback(proceed);
    })

}


function setBlacklistX(Discord, mysql, options, msg, allowDeny, callback) {

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
                myrolename.push(all[k].rolename.replace(/^\@/, ""))
            }
            if (options.value_num.length > 0 && options.value_num.includes(k)) {
                myrole.push(all[k].roleid)
                myrolename.push(all[k].rolename.replace(/^\@/, ""))
            }

        }
        console.log(myrole)
        if(myrole.length == 0){
        	embed.setDescription("Sorry, no valid roles specified")
        
        }else{
		if (mychoices.length>0){
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
                            value: mychoices[i],
                            sap: myrole[k]
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
        embed.setDescription("Blacklisting changed to **" + allowDeny + "** of **" + mychoices.join(", ") + "** for roles: " + myrolename.join(", "))        
        }else{
        embed.setDescription("You need to specify which words to blacklist")
        }
        }
        
        mh.send(msg, embed, options)
    })

}

function subDel(query1, mysql) {
    return new Promise((resolve) => {
        //	    console.log(query1)

        dh.mysqlQuery(mysql, query1, function(err, all) {
            resolve(all)
        })

    })
}

function setSubscribeX(Discord, mysql, options, msg, subUnsub, callback) {

    var embed = mh.prepare(Discord)
    embed.setTitle("Subscription configuration")

    var thisoption = "-" + subUnsub;
    var mychoices = [0, 1, 2]
    if (options.value_num.length > 0) mychoices = [...options.value_num]

    //console.log(mychoices)


    var promises = [];

    for (var i = 0; i < mychoices.length; i++) {
        var query1 = "DELETE FROM guilds_settings WHERE settingsid = '" + options["settingsid"] + "' AND settingstype = '" + options["settingstype"] + "' AND setting = '-sub' AND value = '" + mychoices[i] + "'";
        promises.push(subDel(query1, mysql))
    }

    Promise.all(promises).then(values => {
        for (var i = 0; i < mychoices.length; i++) {
            if (options.options.includes("-sub")) {
                var query2 = "INSERT into guilds_settings (settingsid, settingstype, setting, sap, value) VALUES ('" + options["settingsid"] + "','" + options["settingstype"] + "','" + "-sub" + "','" + msg.channel.id + "','" + mychoices[i] + "')";
                //console.log(query2)
                dh.mysqlQuery(mysql, query2, function(err, all) {
                    return (all)
                });
            }
        }

    }).then(function() {
        callback(false)
    })

    embed.setDescription("Subscription changed to **" + subUnsub + "** of **" + mychoices.join(", ") + "**")
    mh.send(msg, embed, options)

}

function setBlacklist(Discord, mysql, options, msg, callback) {
    //console.log("BLACKLIST")
    dh.getDbData(mysql, "guilds_roles", {
        guild: msg.guild.id
    }, function(all) {
        var roles = [];
        //console.log(all)

        for (var i = 0; i < all.length; i++) {
            roles.push(all[i]["rolename"].replace(/^\@/, ""))
        }

        var thisoption = "-blacklist";
        var allchoices = roles;
        //console.log(roles)
        var mychoices = [...options.value_num]
        var embed = mh.prepare(Discord)
        embed.setTitle("Blacklisting configuration")

        embed.setDescription("If you want to regulate how your members can use specific commands or blacklist words where the bot responds in general, you can do this here. Edit the permissions for specific commands/blacklist words by guild role as follows. Direct messages to the bot are unaffected from these settings!")

        var validchoices = []
        var pending = thisoption.substring(1, thisoption.length)

        embed.addField("Possible choices:", setupChoices(allchoices))

        if (msg.guild) {
            embed.addField("Setup the blacklisting for the complete guild:", "**!config -deny !roll, !doll, !price**\n**!config -allow !price**")
            //            embed.addField("Setup rules for this channel/me only:", "**!config -deny -channel !roll**\n**!config -deny -me !youtube**")
            embed.addField("Setup these for specific guild roles:", "**!config -deny 1,2 !poll**\n**!config -allow 1,2,3 !vote**")
            //            embed.addField("To continue without changes with the configuration:", "**!config**")
        } else {
            embed.addField("Setup the blacklisting for my direct messages:", "**!config -forbid !youtube**")
        }
        mh.send(msg, embed, options)
    })
}

function setSubscription(Discord, mysql, options, msg, callback) {
    //console.log("SUBSCRIBE")

    var thisoption = "-subscription";
    var mychoices = [...options.value_num]
    var embed = mh.prepare(Discord)
    embed.setTitle("Subscription configuration")

    embed.setDescription("It is possible to be automatically and directly notified in a specified channel or with a direct message by making a subscription. Go to your desired channel for this, or switch to direct message to the bot and subscribe to one or more of the possible choices:")

    var validchoices = []

    embed.addField("Possible choices:", setupChoices(terms[thisoption]))

    if (msg.guild) {
        embed.addField("Subscribe/Unsubscribe for a channel:", "**!config -sub 0,1,2**\n**!config -unsub 1**")
        //            embed.addField("Setup subscription for me only:", "**!config -sub -me 1,3 **\n**or just in a direct message to the bot**")
    } else {
        embed.addField("Setup subscription for my direct messages:", "**!config -sub 0,1,2**\n**!config -unsub 1**")
    }

    mh.send(msg, embed, options)
}


function setMegaserverTxt(Discord, mysql, options, msg, callback) {
    var embed = mh.prepare(Discord)
    embed.setTitle("Megaserver configuration")

    var thisoption = "-megaserver";
    var mychoices = [...options.value_num]

    writeSettings(embed, mysql, options, msg, terms[thisoption], mychoices, thisoption, " 1**", function(proceed) {
        callback(proceed);
    })
}

function setTimezone(Discord, mysql, options, msg, callback) {
    var embed = mh.prepare(Discord)
    embed.setTitle("Timezone configuration")

    var thisoption = "-timezone";
    var mychoices = [...options.others]

    if (mychoices.length == 1)
        mychoices = zone.searchZone(mychoices[0]);

    if (mychoices.length == 1) {
        clearGuildConfig(mysql, {
            id: options["settingsid"],
            type: options["settingstype"],
            setting: "-timezone"
        },
            function () {
                newGuildConfig(mysql, {
                    id: options["settingsid"],
                    setting: "-timezone",
                    type: options["settingstype"],
                    value: mychoices[0]
                }, function () {
                    callback(false)
                })
            }
        )
        
        embed.setDescription("Timezone set to " + mychoices[0])
    } else {
        embed.setDescription("You need to specify only the timezone to use.\n\nSee https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for timezone names")
    }

    mh.send(msg, embed, options)
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
    dh.mysqlQuery(mysql, query, function(all) {
        callback(all)
    });
};


module.exports = (bot, msg, options, mysql, Discord) => {

    var allconfigsteps = {
        "-megaserver": function(callback) {
            setMegaserverTxt(Discord, mysql, options, msg, function(proceed) {
                callback(proceed)
            })
        },
        "-replytype": function(callback) {
            setReplyTxt(Discord, mysql, options, msg, function(proceed) {
                callback(proceed)
            })
        },
        "-blacklist": function(callback) {
            setBlacklist(Discord, mysql, options, msg, function(proceed) {
                callback(proceed)
            })
        },
        "-deny": function(callback) {
            setBlacklistX(Discord, mysql, options, msg, "deny", function(proceed) {
                callback(proceed)
            })
        },
        "-allow": function(callback) {
            setBlacklistX(Discord, mysql, options, msg, "allow", function(proceed) {
                callback(proceed)
            })
        },
        "-subscription": function(callback) {
            setSubscription(Discord, mysql, options, msg, function(proceed) {
                callback(proceed)
            })
        },
        "-sub": function(callback) {
            setSubscribeX(Discord, mysql, options, msg, "sub", function(proceed) {
                callback(proceed)
            })
        },
        "-unsub": function(callback) {
            setSubscribeX(Discord, mysql, options, msg, "unsub", function(proceed) {
                callback(proceed)
            })
        },
        "-timezone": function (callback) {
            setTimezone(Discord, mysql, options, msg, function (proceed) {
                callback(proceed)
            })
        }
    }

    var guildconfigstep = [];
    var guildconfigstepall = Object.keys(allconfigsteps);

    options["settingsid"] = msg.author.id
    options["settingstype"] = "user"


    if (msg.guild){
    	if(msg.guild.members.get(msg.author.id).permissions.has("MANAGE_CHANNELS")){
	        options["settingsid"] = msg.guild.id
    	    options["settingstype"] = "guild"
    	    var embed = mh.prepare(Discord)
    	    	embed.addField("Settings scope:","**guild-wide** (admin mode), switch to direct message to the bot, if you want to make personal settings for DMs.")
    	    	mh.send(msg, embed, options)
    	}else{
     	    var embed = mh.prepare(Discord)
    	    	embed.addField("Settings scope:","personal, switching to direct message for config, since you do not have permission to MANAGE CHANNELS in the guild you entered the commands.")
	    	    options["rechannel"] = "DM"	    	
    	    	mh.send(msg, embed, options)
    }}
     
    if (options["settingstype"] == "user") {
        fh.removeElement(guildconfigstepall, "-blacklist")
        fh.removeElement(guildconfigstepall, "-replytype")
    	fh.removeElement(guildconfigstepall, "-deny")
    	fh.removeElement(guildconfigstepall, "-allow")
    }

    //  fh.removeElement(guildconfigstepall, "-sub")
    //  fh.removeElement(guildconfigstepall, "-unsub")

    //   var defaultconfigsteps = [...guildconfigstepall];

    dh.getDbData(mysql, "guilds_settings", {
        settingsid: options["settingsid"]
    }, function(configsteps) {

        dh.getDbData(mysql, "guilds_roles", {
            guild: options["settingsid"]
        }, function(roles) {

            var currentConfig = ""
            var prevConfigs = {}

            for (var i = 0; i < configsteps.length; i++) {
                //console.log(configsteps[i])
                if (!prevConfigs[configsteps[i]["setting"]]) prevConfigs[configsteps[i]["setting"]] = []
                if (terms[configsteps[i]["setting"]]) {
                    if (configsteps[i]["setting"] == "-deny") {
                        prevConfigs[configsteps[i]["setting"]].push(terms[configsteps[i]["setting"]] + "@" + [configsteps[i]["sap"]])
                    } else {
                        prevConfigs[configsteps[i]["setting"]].push(terms[configsteps[i]["setting"]][configsteps[i]["value"]])
                    }

                } else {
                    prevConfigs[configsteps[i]["setting"]].push(configsteps[i]["value"] + "@" + [configsteps[i]["sap"]])
                }

            }
            
            var embed = mh.prepare(Discord);
            embed.setTitle("Current configuration:")

            for (var i = 0; i < guildconfigstepall.length; i++) {
                if (prevConfigs[guildconfigstepall[i]]) {
                    //console.log(guildconfigstepall[i])
                    if (guildconfigstepall[i] == "-deny") {

                        var roleHash = {}
                        for (var d = 0; d < roles.length; d++) {
                            roleHash[roles[d]["roleid"]] = roles[d]["rolename"].replace(/^@/, "");
                        }

                        var denyHash = {}
                        for (var d = 0; d < prevConfigs[guildconfigstepall[i]].length; d++) {
                            var tmpDeny = prevConfigs[guildconfigstepall[i]][d].split("@")
                            if (!denyHash[tmpDeny[1]]) denyHash[tmpDeny[1]] = []
                            denyHash[tmpDeny[1]].push(tmpDeny[0])
                        }
                        var denyTxt = "";
                        for (var d = 0; d < Object.keys(denyHash).length; d++) {
                            denyTxt += "\n**" + roleHash[Object.keys(denyHash)[d]] + "**: " + fh.uniqArray(denyHash[Object.keys(denyHash)[d]]).join(", ")

                        }
                        embed.addField("-blacklist", denyTxt)
                    }
                    if (["-sub"].includes(guildconfigstepall[i])) embed.addField("-subscription", prevConfigs[guildconfigstepall[i]].join("\n"))

                    if (!["-unsub", "-allow", "-sub", "-deny", "-blacklist", "-help", "-blacklist", "-subscription"].includes(guildconfigstepall[i])) embed.addField(guildconfigstepall[i], prevConfigs[guildconfigstepall[i]].join(", "))
                    //	if (["-deny"].includes(guildconfigstepall[i])) embed.addField("-blacklist","Everything is allowed for everybody! Type **!config -blacklist** to change rules.")    		
                } else {
                    if (["-deny"].includes(guildconfigstepall[i])) embed.addField("-blacklist", "Everything is allowed for everybody! Type **!config -blacklist** to change rules.")
                    if (["-sub"].includes(guildconfigstepall[i])) embed.addField("-subscription", "Not subscribed to news! Type **!config -subscription** to set up.")
                    if (!["-unsub", "-sub", "-unsub", "-deny", "-allow", "-help", "-blacklist", "-subscription"].includes(guildconfigstepall[i])) embed.addField(guildconfigstepall[i], "Unconfigured! Type **!config " + guildconfigstepall[i] + "** to set up.")
                }
                // fh.removeElement(guildconfigstepall, guildconfigstep)

            }


            if (allconfigsteps[options.options[0]]) {
                allconfigsteps[options.options[0]](function(proceed) {})
            } else {
                mh.send(msg, embed, options)
            }
        })
    })
};