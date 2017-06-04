// v2 ready

// node modules
const moment = require('moment-timezone');

// helper functions
const fh = require("../helper/functions.js")
const dh = require("../helper/db.js")
const mh = require("../helper/messages.js")

vendorTexts = {
    "golden": {
        "name": "Adhazabi Aba-daro the Golden",
        "pastT": "With fair and low prices, this honest cat sold ",
        "pastF": "\n\nIt is not Adhazabi's fault, and can not take back this, if a buyer has trouble to kill well with it. ",
        "futureT": "This cat's store has not yet opened.",
        "futureF": "This she can tell, Adhazabi will start to sell some beautiful wares ",
        "currentT": "This weekend, Adhazabi has plenty of gear to sell",
        "currentF": "\n\nHurry up with your dealings, Adhazabi will close her crates again ",
        "footer": "Khajiit got this from www.benevolentbowd.ca",
        "proto": "kena",
        "soon": "A buyer has to be patient, this cat is sorting it's crates and will have her wares ready in a few minutes.",
        "before": "This was sold before:",
        "truncT": "This was a lot",
        "truncF": "Khajitt only tells you the last 15 you searched for, give more details to list all.",
        "sorryT" : "Khajiit does not know what to do",
        "sorryF" : "She does not think she sold something like that before"
    },
    "luxury": {
        "name": "Zenil Theran",
        "pastT": "Only for the best houses, we sold ",
        "pastF": "\n\nAll purchases have been delivered to the buyers.",
        "futureT": "We do not offer any luxury articles at this time.",
        "futureF": "Our store will open ",
        "currentT": "You are lucky, we have best quality wares this weekend ",
        "currentF": "\n\nBe fast to get these special offers, we will close again ",
        "footer": "This information was obtained from www.benevolentbowd.ca",
        "proto": "statue",
        "soon": "We are sorting our display at the moment, be patient for a couple of more minutes.",
        "before": "Yes, we had such items in stock:",
        "truncT": "Not all results are displayed",
        "truncF": "Please be more specific in your search, the results here have been truncated after the 15th hit, sorted by date.",
        "sorryT" : "I really apologize",
        "sorryF" : "Unfortunately, we never had such in stock."        
    }
}


function getHelp(options, type, embed, callback) {

    embed.setTitle("Options for " + options.command)
    embed.addField(options.command, "Shows the current stock on sale")
    embed.addField(options.command + " -12", "Shows sales 12 weeks ago, choose any number")
    embed.addField(options.command + " 2017-04-28", "Shows sales on the weekend of 28th April 2017")
    embed.addField(options.command + " " + vendorTexts[type]["proto"], "Shows all sales that match '" + vendorTexts[type]["proto"] + "' in the items")

    callback(embed)
}

function getDbMaxId(mysql, type, callback) {
    var query = 'SELECT MAX(dateid) FROM vendors WHERE type = "' + type + '"';
    dh.mysqlQuery(mysql, query, function(error, resultsMax) {
        var query2 = 'SELECT date FROM vendors WHERE type = "' + type + '" AND dateid = "' + resultsMax[0]['MAX(dateid)'] + '"';
        dh.mysqlQuery(mysql, query2, function(error, resultsDate) {
            callback(error, {
                "id": resultsMax[0]['MAX(dateid)'],
                "date": resultsDate[0]['date']
            })
        })
    })
}

function getDbRecords(mysql, column, args, type, callback) {
    var query = 'SELECT * FROM vendors WHERE ' + column + ' = ' + args + ' AND type = "' + type + '"';
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(error, results)
    })
}

function getDbbyName(mysql, args, type, callback) {
    var query = 'SELECT * FROM vendors WHERE (SOUNDEX(item) LIKE CONCAT("%",SOUNDEX("'+ args +'"),"%")) OR (item LIKE "%'+ args +'%") AND type = "' + type + '" ORDER BY date DESC LIMIT 15';
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(error, results)
    })
}

// return of the module
module.exports = (bot, msg, options, mysql, type, Discord) => {
    var embed = mh.prepare(Discord)

    if (options.options == "-help" | options.others.includes("help")) {
        getHelp(options, type, embed, function(helpembed) {

            mh.send(msg, helpembed);
        })

    } else {
        embed.setAuthor(vendorTexts[type].name + " says")



        if (options.others.length == 0) { // by anything date related

            getDbMaxId(mysql, type, function(err, max) {
                var args = Number(max.id);
                var weeks = ""

                if (options.options.length > 0) {
                    if (fh.isNumeric(Number(options.options[0]))) {
                        var diff = Number(options.options[0])

                        if (diff <= -args) {
                            args = 1
                        } else if (diff > 0) {} else {
                            args = args + Number(options.options)
                        }
                        weeks = Number(max.id) - args;
                    }
                }

                var lagacytxt = ""
                var column = "dateid"

                if (options.date.length > 0) {
                    column = "date"
                    args = '"' + options.date[0] + '"'
                }

                getDbRecords(mysql, column, args, type, function(err, all) {

                    if (all.length > 0) {

                        all.forEach(function(obj) {
                            lagacytxt += "\n* " + obj.item;
                        });

                    }
                    var vendorOn = moment().startOf('isoweek').add(5, 'days').add(2, 'hours')
                    var vendorOnDate = vendorOn.tz("Europe/Berlin").unix()
                    var vendorOffDate = vendorOn.add(48, 'hours').tz("Europe/Berlin").unix()
                    var remainingOn = moment.unix(vendorOnDate).fromNow();
                    var remainingOff = moment.unix(vendorOffDate).fromNow();

                    if (weeks > 0) {
                        embed.addField(vendorTexts[type]["pastT"] + weeks + " weeks ago:", lagacytxt + vendorTexts[type]["pastF"])
                    } else if (column == "date") {
                        var newdate = options.date[0].split("-").reverse().join(".")
                        embed.addField(vendorTexts[type]["pastT"] + " at the " + newdate, lagacytxt + vendorTexts[type]["pastF"])
                    } else if (remainingOn.startsWith("in")) {
                        embed.addField(vendorTexts[type]["futureT"], vendorTexts[type]["futureF"] + remainingOn)
                    } else if (remainingOff.startsWith("in")) {
                        var searchdate1 = moment().tz("America/New_York").format("YYYY-MM-DD");
                        var searchdate2 = moment().tz("America/New_York").add(-1, 'days').format("YYYY-MM-DD");

                        console.log(max.date + "-" + searchdate1 + "/" + searchdate2)
                        if (max.date == searchdate1 || max.date == searchdate2) {
                            embed.addField(vendorTexts[type]["currentT"], lagacytxt + vendorTexts[type]["currentF"] + remainingOff);
                        } else {
                            embed.addField(vendorTexts[type]["currentT"], vendorTexts[type]["soon"]);
                        }
                    }

                    embed.setFooter(vendorTexts[type]["footer"])

                    mh.send(msg, embed);

                });
            }) // max id	
        } else { // by name
            //console.log(options)
            getDbbyName(mysql, options.others.join(" "), type, function(error, results) {

                var nametext = ""
                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        var newdate = results[i].date.split("-").reverse().join(".")
                        nametext += "\n**" + newdate + "**: " + results[i].item
                    }
                    embed.addField(vendorTexts[type]["before"], nametext);
                } else {
                    embed.addField(vendorTexts[type]["sorryT"], vendorTexts[type]["sorryF"]);

                }
                if (results.length == 15) {
                    embed.addField(vendorTexts[type]["truncT"], vendorTexts[type]["truncF"]);
                }

                embed.setFooter(vendorTexts[type]["footer"])

                mh.send(msg, embed);
            })

        }
    } // end not help
};