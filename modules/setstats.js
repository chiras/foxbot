function getSortedKeys(obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys.sort(function(a, b) {
        return obj[b] - obj[a]
    });
}

function isNumber(obj) {
    return !isNaN(parseFloat(obj))
}

module.exports = (bot, msg, setitems, util) => {

    var results = {};
    var fields = ["i1", "i2", "i3", "i4", "i5"]
    var minbonus = msg.content.split(" ").slice(1)[0]
    var filter;

    if (isNumber(minbonus)) {
        filter = new RegExp(msg.content.split(" ").slice(2).join(" "), "i")
    } else {
        filter = new RegExp(msg.content.split(" ").slice(1).join(" "), "i");
        minbonus = 2;

        msg.channel.sendEmbed({
            color: 0x800000,
            fields: [{
                name: "No minimum bonus count provided",
                value: "I have set to a default of 2 for now. You may try !setbonus 1 KEYWORD, if you don't get enough results."
            }]
        });
    }

    for (var j = 0; j < fields.length; j++) {

        var searchField = fields[j];
        //    var filter = new RegExp("Magicka", "i")

        for (var i = 0; i < setitems.length; i++) {
            if (setitems[i][searchField].match(filter)) {
                if (results[setitems[i][searchField]]) {
                    results[setitems[i][searchField]].push(setitems[i].Name)
                } else {
                    results[setitems[i][searchField]] = [setitems[i].Name]
                }

                //	console.log(util.inspect(setitems[i]))

            }
        }
    }

    var bonuskeys = Object.keys(results); // ['alpha', 'beta'] 
    var longones = [];

    for (var k = 0; k < bonuskeys.length; k++) {
        var bonustext = "";
        var curset = results[bonuskeys[k]];

        var countsAll = [];
        var counts = [];

        curset.forEach(function(x) {
            countsAll[x] = (countsAll[x] || 0) + 1;
        });

        curset.forEach(function(x) {
            if (countsAll[x] >= minbonus) {
                counts[x] = countsAll[x]
            }
        });


        //    console.log("-->" + bonuskeys[k] + counts[bonuskeys[k]] +"\n")

        //   if (counts[bonuskeys[k]] >= minbonus) {

        if (bonuskeys[k].length > 50) {
            longones.push(results[bonuskeys[k]])
        } else {
            if (Object.keys(counts).length > 0) {
            if (Object.keys(counts).length < 20) {
                var sorted = getSortedKeys(counts);


                // 			console.log(util.inspect(counts))
                // 			
                var characters = 0;
                var first = "";

                //         	console.log("min: " + minbonus)

                for (var l = 0; l < sorted.length; l++) {

                    if (bonustext.length < 700) {
                        bonustext += "" + sorted[l] + " (" + counts[sorted[l]] + "x); "
                    } else {
                        msg.channel.sendEmbed({
                            color: 0x800000,
                            fields: [{
                                name: first + bonuskeys[k],
                                value: bonustext.substring(0, bonustext.length - 2)
                            }]
                        });
                        bonustext = "" + sorted[l] + " (" + counts[sorted[l]] + "x); "
                        first = "(...continued) ";

                    }
                } // end l
                msg.channel.sendEmbed({
                    color: 0x800000,
                    fields: [{
                        name: first + bonuskeys[k],
                        value: bonustext.substring(0, bonustext.length - 2)
                    }]
                });

        } else {

            msg.channel.sendEmbed({
                color: 0x800000,
                //	description: helpinfo,
                fields: [{
                    name: bonuskeys[k],
                    value: "too many results, please narrow down your request!!"
                }]
            });
        }
        } // at least one hit

        
        } // length check
        
        //   } // min check
    } // end for k

    if (longones.length > 0) {
        if (longones.length < 20) {
            bonustext = "";
            first = "";

            for (var l = 0; l < longones.length; l++) {

                if (bonustext.length < 700) {
                    bonustext += "" + longones[l] + "; "
                } else {
                    msg.channel.sendEmbed({
                        color: 0x800000,
                        fields: [{
                            name: first + "Sets with the keyword in the long description (Set 5 pc or Monster 2 pc)",
                            value: bonustext.substring(0, bonustext.length - 2)
                        }]
                    });
                    bonustext = "" + longones[l] + "; "
                    first = "(...continued) ";

                }
            } // end l
            msg.channel.sendEmbed({
                color: 0x800000,
                fields: [{
                    name: first + "Sets with the keyword in the long description (Set 5 pc or Monster 2 pc)",
                    value: bonustext.substring(0, bonustext.length - 2)
                }]
            });
        } else {

            msg.channel.sendEmbed({
                color: 0x800000,
                //	description: helpinfo,
                fields: [{
                    name: "Sets with the keyword in the long description (Set 5 pc or Monster 2 pc)",
                    value: "too many results, please narrow down your request!!"
                }]
            });
        }
    }

    // msg.channel.sendMessage(bonustext)

    // combine into same types



    // 		msg.channel.sendMessage("Found " + results.length + " sets matching your request.");
    // 		
    // 		if (results.length < 6){
    //         for (var i = 0; i < results.length; i++) {
    // 
    //             var outputsets = "";
    // 
    //             outputsets += "**" + JSON.stringify(results[i].Name) + "** (" + JSON.stringify(results[i].Pieces) + ")" + " obtainable from ";
    //             outputsets += JSON.stringify(results[i].Location) + " (" + JSON.stringify(results[i].Type) + ")\n";
    //             if (results[i].i1 != "") {
    //                 outputsets += "(1 pc) " + JSON.stringify(results[i].i1) + "\n"
    //             };
    //             if (results[i].i2 != "") {
    //                 outputsets += "(2 pc) " + JSON.stringify(results[i].i2) + "\n"
    //             };
    //             if (results[i].i3 != "") {
    //                 outputsets += "(3 pc) " + JSON.stringify(results[i].i3) + "\n"
    //             };
    //             if (results[i].i4 != "") {
    //                 outputsets += "(4 pc) " + JSON.stringify(results[i].i4) + "\n"
    //             };
    //             if (results[i].i5 != "") {
    //                 outputsets += "(5 pc) " + JSON.stringify(results[i].i5) + "\n"
    //             };
    // 
    //             var outputsetsesc = outputsets.replace(/\"/g, "");
    // 
    //             msg.channel.sendMessage(outputsetsesc);
    // 
    //         }		
    // 		}else{
    // 			msg.channel.sendMessage("Please narrow down your request to avoid spam by providing more characters.");
    // 		}

};