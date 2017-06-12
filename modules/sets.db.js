//Craftable, traits, obtainable missing

const sqlite3 = require('sqlite3').verbose();

const nh = require("../data/name_helper.js")
const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")

var itemdb = new sqlite3.Database('./data/dbs/item.db');

function getDbRecords(db, filter, callback) {
    db.all("SELECT * FROM sets WHERE setName LIKE '%"+filter+"%'", function(err, all) {

        if (err){console.log(err)};
	        callback(all);  
    });
}; 

module.exports = (bot, msg, Discord) => {
		var embed = mh.prepare(Discord)
  		embed.setFooter('Data obtained from www.uesp.net')
		
		var limit = 25;
		if (msg.guild){limit = 6}
		
        var results = [];
        var searchField = "Name";
        var filter = msg.content.split(" ").slice(1).join(" ")
        
        getDbRecords(itemdb, filter, function(results){
    		embed.setTitle("Found " + results.length + " sets matching your request.")
 		if (results.length == 1){
 			embed.setImage("http://esoitem.uesp.net/itemLinkImage.php?itemid=70&level=66&quality=5")
 		}
 			if (results.length < limit && results.length > 0){
        	 	for (var i = 0; i < results.length; i++) {
        	 		embed.addField(results[i].setName, 	"**Items: **"+results[i].itemSlots.replace(/ /g, ", ").replace(/\(/g, " (").replace(/container/g, "") + "\n\n"+
        	 											"**Boni: **\n"+
        	 											results[i].setBonusDesc1 + "\n"+
        	 											results[i].setBonusDesc2 + "\n"+
        	 											results[i].setBonusDesc3 + "\n"+
        	 											results[i].setBonusDesc4 + "\n"+
        	 											results[i].setBonusDesc5 
        	 								//			" http://esoitem.uesp.net/item-70-66-5.png \n" +
        	 								//			"[see image](http://esoitem.uesp.net/item-70-66-5.png)"
        	 										)
        	 										
        	 	}
				
   			}


        mh.send(msg.channel,embed)
    		
        })
        
        
        return;
    	
		
		if (results.length < limit && results.length > 0){
        var outputsets = [];
            
        for (var i = 0; i < results.length; i++) {
        
        	var locations = []
        	var locationsIDs = Object.keys(results[i].Location)
        	
        	//console.log()
        	
        	for (var j = 0; j < locationsIDs.length; j++){     
        	  			        
	        	var tmpL = "";
        		var tmpD = "";
        		var tmp = "";
        		
        		if (JSON.stringify(results[i].Location[locationsIDs[j]])!='""'){
        			var tmpL = JSON.stringify(results[i].Location[locationsIDs[j]]);
	        		tmp +=  nh.linkify(tmpL)
	        		
				//	console.log(JSON.stringify(locationsIDs[j]));
					
	        		if (JSON.stringify(locationsIDs[j]) != '"default"'){
	        			var tmpX = JSON.stringify(locationsIDs[j]);
	        		//	console.log(tmpX);

	        			tmp +=  " ("+ nh.linkify(tmpX) +")";
	        		}
        			
        		}
        		if (JSON.stringify(results[i].LocationDetail[locationsIDs[j]]) !='""'){
        		        	console.log(JSON.stringify(results[i].LocationDetail[locationsIDs[j]]))

        			var tmpD = JSON.stringify(results[i].LocationDetail[locationsIDs[j]]);
  	        		tmp +=  ": " + nh.linkify(tmpD)
	      		}
	      		
   	          if (tmp != ""){locations.push(tmp)}
     		
        	}
        	
        	var location = locations.join(", ")
        	       
	//		var location = "xx"//JSON.stringify(results[i].Location)
	//		location = nh.linkify(JSON.stringify(results[i].Location))

			// if (JSON.stringify(results[i].LocationPrecise)){ 
// 				var location_tmp = JSON.stringify(results[i].LocationPrecise);
// 				location += ": " + nh.linkify(JSON.stringify(results[i].LocationPrecise))
// 				}
		
            outputsets[JSON.stringify(results[i].Name)] =  JSON.stringify(results[i].Pieces) + "," + " obtainable from ";
            outputsets[JSON.stringify(results[i].Name)] += location + " (" + JSON.stringify(results[i].Type) + ")\n";
            if (results[i].i1 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(1 pc)** " + JSON.stringify(results[i].i1) + "\n"
            };
            if (results[i].i2 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(2 pc)** " + JSON.stringify(results[i].i2) + "\n"
            };
            if (results[i].i3 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(3 pc)** " + JSON.stringify(results[i].i3) + "\n"
            };
            if (results[i].i4 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(4 pc)** " + JSON.stringify(results[i].i4) + "\n"
            };
            if (results[i].i5 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(5 pc)** " + JSON.stringify(results[i].i5) + "\n"
            };

        msg.channel.sendEmbed({
  			color: 0x800000,
  		//	description: helpinfo,
  			fields: [{
       			 name: Object.keys(outputsets)[i].replace(/\"/g, ""),
       			 value: outputsets[Object.keys(outputsets)[i]].replace(/\"/g, "")
     		 }
    		]
		});

         //   var outputsetsesc = outputsets.replace(/\"/g, "");

         //   msg.channel.sendMessage(outputsetsesc);

        }		
		}else if(results.length == 0){
	//		msg.channel.sendMessage("Please avoid metacharacters like hyphens or apostrophes. Tip: you can search for incomplete names as well e.g.\n**!set skel**\nwill prompt also sets matching Skeleton.");
        msg.channel.sendEmbed({
  			color: 0x800000,
  			description: "Please avoid metacharacters like apostrophes. \nTip: you can search for incomplete names as well e.g.\n**!set skel**\nwill prompt also sets matching 'Skeleton'.",
		});		
		}else{
	//		msg.channel.sendMessage("Please narrow down your request to avoid spam by providing more characters.");
        msg.channel.sendEmbed({
  			color: 0x800000,
  			description: "In guild channels, only a maximum of 5 results will be printed. Please narrow down your request to avoid spam by providing more characters. \n\nTip: You can also whisper the bot directly, there the limit is set to a maximum of 20",
		});		
		}
		
// 		
//         msg.channel.sendEmbed({
//   			color: 0x800000,
//   		//	description: helpinfo,
//   			fields: [{
//        			 name: Object.keys(outputsets)[0].replace(/\"/g, ""),
//        			 value: outputsets[Object.keys(outputsets)[0]].replace(/\"/g, "")
//      		 },
//      		 {
//        			 name: Object.keys(outputsets)[1].replace(/\"/g, ""),
//        			 value: outputsets[Object.keys(outputsets)[1]].replace(/\"/g, "")
// 			},
//      		 {
//        			 name: Object.keys(outputsets)[2],
//        			 value: outputsets[Object.keys(outputsets)[2]]
// 			}
//     		]
// 		});

};