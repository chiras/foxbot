//         if (catname != "0x"){  --> are still in the counter ,but not displayed anymore --> hack

const FuzzyMatching = require('fuzzy-matching');
const sql = require('mysql');

const tokens = require('../tokens/dev.json');

const nh = require("../helper/names.js")
const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")
const fh = require("../helper/functions.js")
//const help = require("../help.js")

var mysql = sql.createPool({
    host: 'localhost',
    user: tokens["mysqluser"],
    password: tokens["mysqlpass"],
    database: 'foxbot'
});
var fm;

getDbRecords(mysql, "", "setName", function(error, all) {
    var namearray = [];
    for (var i = 0; i < all.length; i++) {
        namearray = namearray.concat(all[i].setName.split(" "))
    }
    fm = new FuzzyMatching(namearray);
})

Array.prototype.chunk = function(n) {
    if (!this.length) {
        return [];
    }
    return [this.slice(0, n)].concat(this.slice(n).chunk(n));
};

function getDbRecords(mysql, filter, column, callback) {
    var query = "SELECT * FROM items_sets WHERE " + column + ' LIKE "%' + filter.replace(/ /g,"%") + '%"';
 //   console.log(query)
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(error, results)
    })
};

function occurrences(string, subString, allowOverlapping) {
    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function getDetailList(results, embed, callback) {
    for (var i = 0; i < results.length; i++) {
        var tttext = ""
        if (results.length != 1) {
      //      tttext = "[Tooltip](http://esoitem.uesp.net/item-" + results[i].representative + "-66-5.png), "
        }
      //   tttext += "[UESP Wiki Page](http://en.uesp.net/wiki/Online:"+encodeURI(results[i].setName)+"), "
      //   tttext += "[Fextralife](http://elderscrollsonline.wiki.fextralife.com/"+encodeURI(results[i].setName.replace(/ /g, "+"))+"+Set)\n\n"

        embed.addField(results[i].setName, tttext +
            "**Items: **" + results[i].itemSlots.replace(/ /g, ", ").replace(/\(/g, " (").replace(/container/g, "") + "\n\n" +
            "**Boni: **\n" + results[i].setBonusDesc 
        )

        // Missing crafting information and origin, Type (PvP)		
    }
    callback(embed)
}

function getPreviewList(msg, results, embed, filter, Discord, options, callback) {

    var concattxt = ""
    var onlynames = []
    var orderby = [];
    var reps = {};

    var accchar = 0;
    var maxchar = 800;
    var fields = 0;
    var maxfields = 20;
    var z = 0;
    var maxitems = results.length / 20

    for (var i = 0; i < results.length; i++) {
        if (filter != "") {
            orderby.push(occurrences(results[i].setBonusDesc.toLowerCase(), filter.toLowerCase()) + "x")
            onlynames.push(results[i].setName) //+ " (" + orderby[i] + ")"); 							
        } else {
            orderby.push(results[i].setName.substring(0, 1))
            onlynames.push(results[i].setName);
        }
        reps[results[i].setName] = results[i].representative;
    }

    var cats = fh.uniqArray(orderby);
    cats = cats.sort()

    for (var z = 0; z < cats.length; z++) {
        var indices = orderby.reduce(function(a, e, i) {
            if (e === cats[z])
                a.push(onlynames[i]);
            return a;
        }, []);

        indices = indices.sort();

        var catname = cats[z]
        if (catname != "0x"){
        fields = fields + 1;

        for (var i = 0; i < indices.length; i++) {
            if (concattxt.length > maxchar) {
                fields = fields + 1;
                if (fields > maxfields) {
                    mh.send(msg, embed, options)
                    embed = mh.prepare(Discord)
                    fields = 0;
                }
                embed.addField(catname, concattxt.substring(2))
                concattxt = ""
                catname = cats[z] + "..."
            }
            //concattxt += ", [" + indices[i] + "](http://esoitem.uesp.net/item-" + reps[indices[i]] + "-66-5.png)"
            concattxt += ", " + indices[i]
        }
        embed.addField(catname, concattxt.substring(2))
        concattxt = ""
		}
    }

    callback(embed)
}

function getImages(results, msg, Discord, options) {
    for (var i = 0; i < results.length; i++) {
        var img = mh.prepare(Discord)
        img.setImage("http://esoitem.uesp.net/item-" + results[i].representative + "-66-5.png")
        mh.send(msg, img, options)
    }
}

var abbrev = {
	bsw : "burning spellweave"
}

module.exports = (bot, msg, options, Discord) => {

    var embed = mh.prepare(Discord)

    if (options.options.includes("-help") ||  (options.others.length == 0 && !options.options.includes("-all"))) {
    	embed.setTitle("Options for " + options.command)
    	embed.setDescription("Extended documentation available at: [foxbot.biotopia.info](http://foxbot.biotopia.info/?page_id=184)")
        embed.addField(options.command, "Shows this help")
        embed.addField(options.command + " text", "Shows matches for this text in the set name. Partial names and single types should also yield results. If no set with that name can be found, it will search through the set boni for your query.")
        embed.addField(options.command + " -bonus ", "Searches only through boni, not the names. This will help when set names are prioritized but interested in the boni.")
        embed.addField(options.command + " -all ", "Forces a list of all set names")
        embed.addField(options.command + " -tooltip skel", "Will also produce directly viewable tooltips instead of links for every resulting set (be careful in this use, very slow and needs a lot of space!)")
        mh.send(msg, embed, options)
		
    } else {
        embed.setFooter('Data obtained from www.uesp.net')

        var limit = 25;
        if (msg.guild) {
            limit = 6
        }
        
		for (var i = 0; i < options.others.length;i++){
			if (abbrev[options.others[i]]){
				options.others[i] = abbrev[options.others[i]]
			}else{
			var fms = fm.get(options.others[i]);
			//console.log(fms.distance)
       		if (fms.distance > 0.75) {
           		 options.others[i] = fms.value
       		}
       		}
        }
        
        var filter = options.others.join(" ")

        filter = filter.toLowerCase().replace(/max /g, "maximum ")
        filter = filter.toLowerCase().replace(/regeneration/g, "recovery")
        filter = filter.toLowerCase().replace(/regen/g, "recovery")

		//console.log(filter)
        getDbRecords(mysql, filter, "setName", function(error, results) {


            if (!options.options.includes("-bonus")) {

                if (results.length < limit && results.length > 0) {
                    getDetailList(results, embed, function(returnEmbed) {
                        embed = returnEmbed;
                    })
                    embed.addField("Found " + results.length + " sets", "Matching your request '" + filter + "' in the name.")
                    mh.send(msg, embed, options)

                    if (results.length == 1 ||  options.options.includes("-tooltip")) {
                        getImages(results, msg, Discord, options)
                    }
                } else if (results.length > 0) {

                    getPreviewList(msg, results, embed, "", Discord, options, function(returnEmbed) {
                        embed = returnEmbed;
                    })
                    embed.addField("Found " + results.length + " sets", "Matching your request '" + filter + "' in the name. Narrow down your request to see set details or click the tooltip links.")
                    mh.send(msg, embed, options)

                }
            }

            if (results.length == 0 ||  options.options.includes("-bonus")) {
                getDbRecords(mysql, filter, "setBonusDesc", function(error2, resultsBoni) {
        			if (error2){
        				//console.log(error2);
        				return;
        			}
                    if (resultsBoni.length < limit && resultsBoni.length > 0) {

                        getDetailList(resultsBoni, embed, function(returnEmbed) {
                            embed = returnEmbed;
                        })
                        embed.addField("Found " + resultsBoni.length + " sets", "Matching your request '" + filter + "' in the set boni.")

                        if (resultsBoni.length == 1 ||  options.options.includes("-tooltip")) {
                            getImages(resultsBoni, msg, Discord, options)
                        }

                    } else if (resultsBoni.length > 0) {

                        getPreviewList(msg, resultsBoni, embed, filter, Discord, options, function(returnEmbed) {
                            embed = returnEmbed;
                        })
                        embed.addField("Found " + resultsBoni.length + " sets", "Matching your request '" + filter + "' in the set boni. Narrow down your request to see set details or click the tooltip links.")
                    }

                    if (resultsBoni.length == 0) {
                        embed.addField("Sorry!", "I was not able to find anything regarding your request. Try **!set -help** for more options.")

                    }
                    mh.send(msg, embed, options)

                })


            }
        })


    }
};