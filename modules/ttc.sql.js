const FuzzyMatching = require('fuzzy-matching');
const sql = require('mysql');
const Promise = require('bluebird');
const moment = require('moment-timezone');

const tokens = require('../tokens/dev.json');

const nh = require("../helper/names.js")
const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")
const fh = require("../helper/functions.js")

var mysql = sql.createPool({
    host: 'localhost',
    user: tokens["mysqluser"],
    password: tokens["mysqlpass"],
    database: 'foxbot'
});
var fm;

getDbRecords(mysql, "items_ttc", "", function(error, all) {
    var namearray = [];
    for (var i = 0; i < all.length; i++) {
        namearray.push(all[i].name)
    }
    fm = new FuzzyMatching(namearray);
})

Array.prototype.chunk = function(n) {
    if (!this.length) {
        return [];
    }
    return [this.slice(0, n)].concat(this.slice(n).chunk(n));
};
function getDateRecord(mysql, table, args, callback) {
    var query = "SELECT timestamp FROM items_prices_ttc_info WHERE id = 0;";
    //console.log(query)
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(error, results)
    })
};

function getDbRecords(mysql, table, args, callback) {
    var query = "SELECT * FROM " + table + " " + args //+ ' LIKE "%' + filter + '%"';
    //console.log(query)
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(error, results)
    })
};

function getDbPromise(mysql, table, args) {
    return new Promise((resolve) => {

        var query = "SELECT * FROM " + table + " " + args //+ ' LIKE "%' + filter + '%"';
 //   console.log(query)
        dh.mysqlQuery(mysql, query, function(error, results) {
        	if (error){
        		console.log(error)
        		return;
        	}
            resolve(results)
        })
    })
};


var quality = {
    0: ":black_heart:",
    1: ":green_heart:",
    2: ":blue_heart:",
    3: ":purple_heart:",
    4: ":yellow_heart:"
}
var traits = {
    0: "powered",
    1: "charged",
    2: "precise",
    3: "infused",
    4: "defending",
    5: "training",
    6: "sharpened",
    7: "decisive",

    8: "sturdy",
    9: "impenetrable",
    10: "reinforced",
    11: "well-fitted",
    12: "prosperous",
    13: "divines",
    14: "nirnhoned",
    15: "intricate",
    16: "ornate",
    17: "arcane",
    18: "healthy",
    19: "robust",
    20: "special"

}


var effects = {
    0: "Health",
    1: "Magicka",
    2: "Stamina",
    3: "Spell Crit",
    4: "Weapon Crit",
    5: "Spell Power",
    6: "Weapon Power",
    7: "Spell Resist",
    8: "Armor",
    9: "Detection",
    10: "Invisibility",
    11: "Speed",
    12: "Unstoppable",
    13: "Rav Health",
    14: "Rav Magicka",
    15: "Rav Stamina",
    16: "Enervation",
    17: "Cowardice",
    18: "Maim",
    19: "Vitality",
    20: "Breach",
    21: "Fracture",
    22: "Hindrance",
    23: "Entrapment",
    24: "Protection",
    25: "Linger Health",
    26: "Defile",
    27: "Grad Rav Health",
    28: "Vulnerability",
    58: "Uncertainty"

}

function argumentSlicer(text, callback) {
    var tmp = text.split(" ").slice(1).join(" ").replace(/ /g, /,/).split(",")


}

// Here the module export begins
module.exports = (bot, msg, options, Discord) => { // these arguments must be passed through the main 
var dateString ;
    var embed = mh.prepare(Discord)
    if (options.options.includes("-help") || options.others.length == 0){
 //   !price of the sun lvl45-cp10 blue-legendary
 	   embed.setTitle("Options for " + options.command)
    	embed.setDescription("Extended documentation available at: [foxbot.biotopia.info](http://foxbot.biotopia.info/?page_id=196)\n\nThis command gives you a rough idea, how items are listed on guild vendors. The three values are 'minimum - **average** - maximum' list price. In parenthesis: count of individual listings.\n\n* Be as precise as possible \n* Ideally configure your megaserver: **!config -megaserver**\n* All following options are combinable,  best include 2-3 restrictions")
// 	   embed.addField(options.command + " necklace of the viper", "Will provide all listing prices for this item")
 	   embed.addField("Options", "**Megaservers:** 'EU', 'NA'. \n**Qualities:** 'white','green','blue','purple','gold','yellow','normal','fine','superior','epic' and 'legendary', *also as ranges:* blue-purple \n**Traits:** 'powered', 'charged', 'precise', 'infused', 'defending', 'training', 'sharpened', 'decisive', 'sturdy', 'impenetrable', 'reinforced', 'well-fitted', 'prosperous', 'divines', 'nirnhoned', 'intricate', 'ornate', 'arcane', 'healthy', 'robust'\n**Level:** *Veteran:* cp150, *Non-Vet:* lvl30, *Ranges:* lvl30-cp140\n**Vouchers:** \n!price sealed writ 80 --> displayes all writs that give back 80 vouchers\n!price sealed black writ 80-90 --> all blacksmithing writs with 80 - 90 vouchers");
 	   embed.addField("Good usage examples:","!price sword of the sun EU cp160 epic sharpened precise \n!price immovab cp150 EU\n!price sealed black writ 80-90")
	
	 mh.send(msg,embed, options)
	 
    }else{

        var limit = 20;
        if (msg.guild) {
            limit = 10
        }
        
    if (options.others.length > 0) {
     	getDateRecord(mysql, "items_prices_ttc_info", '', function(err, daterecord) {
     		dateString = moment.unix(daterecord[0].timestamp).format("DD/MM/YYYY");
     	})
        
        var name = options.others.join("%")
        getDbRecords(mysql, "items_ttc", 'WHERE name LIKE "%' + name + '%" ORDER BY name ASC', function(err, all) {
        	if (err){
        		console.log(err)
        		return;
        	}
			
			if (Object.keys(all).length > 0){
			if (Object.keys(all).length < 50){
			
            var q2 = ""
            if (options.level.length > 0 && !name.match(/writ|sealed/) && options.range.length == 0 ) {
                q2 += "AND level IN ('" + options.level.join("','") + "') ";
            }
            if (options.item_quality.length > 0) {
                q2 += "AND quality IN ('" + options.item_quality.join("','") + "') ";
            }
            if (options.item_trait.length > 0) {
                q2 += "AND trait IN ('" + options.item_trait.join("','") + "') ";
            }
            if (options.megaservers.length > 0 &&  ["EU","NA","eu","na"].includes(options.megaservers[0])) {
                q2 += "AND megaserver IN ('" + options.megaservers.join("','") + "') ";
            }        
                 
            if (options.value_num.length > 0 && name.match(/writ|sealed/)) {
                q2 += "AND vouchers IN ('" + options.value_num.join("','") + "')";
           }             
            
            if (options.range.length > 0){
            	for (var r = 0; r < options.range.length;r++){
            	if (options.range[r].type=="numeric" && name.match(/writ|sealed/)){options.range[r].type ="vouchers"}
            	if (options.range[r].type!="numeric" && options.range[r].type!="unknown"){
	                q2 += "AND ("+options.range[r].type+" BETWEEN "+options.range[r].from+" AND "+options.range[r].to+") "

            	}      
            	} 	     
            }
 
 	                if(name.match(/writ|sealed/)){
	                	q2 +="ORDER BY CAST(vouchers AS UNSIGNED) ASC"
	                }      
	                    

            var promises = [];
            for (var i = 0; i < Object.keys(all).length; i++) {
                promises.push(getDbPromise(mysql, "items_prices_ttc", 'WHERE id = "' + all[i].id + '"' + q2))
            }

            Promise.all(promises).then(returned => {
                var values = [];
                var allnames = []
                for (var i = 0; i < returned.length; i++) {
                    if (returned[i].length > 0) {
                        values.push(returned[i])
                        allnames.push(all[i].name)
                    }
                }

                if (values.length > limit) {
                    embed.addField("Too many results", "Please provide more infos to narrow down the search. See **!price -help** for more details.")
                    embed.setDescription(allnames.join("; "))
                    return embed;

                } else {

                    var pricetext = "";
                    var maxchar = 900;
                    var maxfields = 15;
                    var fields = 0;
                	
                	if (values.length > 0) {
                    for (var z = 0; z < values.length; z++) {
                		if (values[z].length > 0) {
                            pricetext = "";

                            var titleorg = fh.capitalFirstLetter(allnames[z]);
                            var titlejoin = ""
                            titleargs = []

                            if (options.megaservers.length == 1 && ["EU","NA","eu","na"].includes(options.megaservers[0])) {
                                titleargs.push("**" + options.megaservers[0] + "**")
                            }

                            if (options.item_quality.length == 1) {
                                titleargs.push(quality[options.item_quality[0]])
                            }

                            if (options.item_trait.length == 1) {
                                titleargs.push(traits[options.item_trait[0]])
                            }

                            if (options.level.length == 1) {
                                titleargs.push(nh.decodeLevel(options.level[0]))
                            }

                            if (titleargs.length > 0) {
                                titlejoin += " (" + titleargs.join(", ") + ")"
                            }
                                

                            
                            title = titleorg + titlejoin

                            for (var i = 0; i < values[z].length; i++) {
                                if (pricetext.length > maxchar) {
                                    fields = fields + 1;
                                    if (fields > maxfields) {
                                    	options["rechannel"] = "lengthRedirect"
                                        mh.send(msg, embed, options)
                                        embed = mh.prepare(Discord)
                                        fields = 0;
                                    }
                                    embed.addField(title, pricetext)
                                    pricetext = ""
                                    title = titleorg + titlejoin + "..."
                                }

                                if (options.megaservers.length != 1 || !["EU","NA","eu","na"].includes(options.megaservers[0])) {
                                    pricetext += "**" + values[z][i]["megaserver"] + "** "
                                }

                                if (typeof quality[values[z][i]["quality"]] !== "undefined" && options.item_quality.length != 1) {
                                    pricetext += quality[values[z][i]["quality"]] + " "
                                }

                                if (options.level.length != 1 && values[z][i]["vouchers"] == null) {
                                    pricetext += nh.decodeLevel(values[z][i]["level"]) + " "

                                }
                                
                                
                                if (values[z][i]["vouchers"] != null) {
                                    pricetext += "vouchers: "+values[z][i]["vouchers"]+ " "

                                }else{
                                
                                if (traits[values[z][i]["trait"]]) {
                                    if (options.item_trait.length != 1) {
                                        pricetext += traits[values[z][i]["trait"]] + " "
                                    }
                                } else {

                                    if (values[z][i]["category"] != null) {
                                        var cats = values[z][i]["category"].split("|")
                                        var cats2 = []
                                        for (var v = 0; v < cats.length; v++) {
                                            if (effects[cats[v]]) {
                                                cats2.push(effects[cats[v]])
                                            } else {
                                                cats2.push(cats[v])
                                            }
                                        }
                                        pricetext += "" + cats2.join("+") + " "

                                    }
                                }}


                                pricetext += "(" + values[z][i]["countAmount"] + "x): " + fh.kFormatter(values[z][i]["min"]) + " g - **" + fh.kFormatter(values[z][i]["avg"]) + " g** - " + fh.kFormatter(values[z][i]["max"]) + " g\n"
                            }
                            embed.addField(title, pricetext)
                        } else {
                            embed.addField(fh.capitalFirstLetter(allnames[z]), "no prices are available for your request")

                        }

                    }
                    } else {
                            embed.addField(name.replace(/%/g," "), "no prices are available  for your request")

                        }
                    return embed;
                }
            }).then(function(embed) {
                embed.setFooter("These prices are **Listing** prices obtained from www.tamrieltradecentre.com, updated: "+dateString)
                mh.send(msg, embed, options);

            })

			}else{
			
               embed.addField("Too many results", "Please provide more infos to narrow down the search. See **!price -help** for more details.")
                mh.send(msg, embed, options);
			
			}
			}else{
			
               embed.addField("Nothing found", "Please change your search details. See **!price -help** for more details.")
	           mh.send(msg, embed, options);
		
			}
        })
    }
    }
};


// https://eu.tamrieltradecentre.com/Download/PriceTable
// SELECT items_ttc.*, items_prices_ttc.* FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%immov%"