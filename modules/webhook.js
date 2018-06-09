const debug = false;
const Promise = require('bluebird');

const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")

var request = Promise.promisifyAll(require('request'));

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

const distributors = {
	"ESO-Database.com" : 0,
	"The Dwemer Automaton" : 0,
	"Fox" : 2,
	"The Undaunted Quartermaster" : 1,
	"The Watcher" : 0,
	"Adhazabi Aba-daro" : 1, 
	"Zenil Theran" : 1 
}

const distributor_icons = {
	"ESO-Database.com" : "",
	"The Dwemer Automaton" : "",
	"Fox" : "",
	"the Undaunted Quartermaster" : "http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png"
}

function getDbRecords(mysql, callback) {
//console.log("db")
var query = "SELECT settingsid, value, settingstype,sap FROM guilds_settings WHERE setting = '-sub'"

dh.mysqlQuery(mysql, query, function(err,all) {
    		callback(err, all)
    	})
};

console.log("Debug Hook: " + debug)

module.exports = (bot, msg, options, mysql, Discord) => {

//if (!debug){
	if (msg.content.startsWith("!") || msg.content=="Hello\nDiscord!"){
		return;	
	}
//}
//console.log("hook")

	var notitype = Number(distributors[msg.author.username])
	var subtext = mh.prepare(Discord);

    subtext.setAuthor("Announcement from "+ msg.author.username)
    subtext.setDescription(msg.content)
// 
// var channels = [{settingsid: "306222637460226048", value: '2', settingstype: 'guild',sap:"451835508176322580"},{ settingsid: "252014907770404864", value: '2', settingstype: 'guild',sap:"322364525221380098"}]//,];
//     
//  console.log(channels) ;
//    
// var p2 = new Promise(function(resolve, reject) {
// //	getDbRecords(mysql, function(err, obj) {
// // 		console.log("channels")
// 		
// 		obj = channels;
//        resolve(obj);
// //	})
// }).then(function(channels){
// 	     channels.forEach(function(channel){
// 
// 		// 
// 
// 		 
// 
// 	     	// see if that channel is still accessible to the bot, now covered in messages.js
// 			//if (typeof bot.channels.get(channel.sap) !== "undefined"){
// 
//     	     options['client']  = bot;		     
// 		     
// 		     if (channel.value == notitype){
// 		     	if (channel.settingstype == "user"){
// 		     		options['rechannelid'] = channel.settingsid;
// 		     		options['rechannel']   = 'announceUser'
// 		     	}else{
// 			     	options['rechannelid'] = channel.sap;
// 			     	options['rechannel'] = 'announceChannel';		     	
// 		     	}
// 		     	
// 		     	console.log(options['rechannelid']);
// 		     	console.log(options['rechannel']);

				for (var i = 0; i < bot.options.shardCount; i++) {
                var query = 'INSERT INTO announcements (shard, announcement, sender) VALUES ('+i+',"'+msg.content+'", "'+msg.author.username+'");';
                dh.mysqlQuery(mysql, query, function(err, all) {
                    return (all)
                });
                }
                
    		// 	bot.shard.broadcastEval("this.shard.fetchClientValues(this.shard.id)").then( (results) => { 
//     				var query = 'INSERT INTO announcements (announced, announcement, sender) VALUES ('+results+',"'+msg.content+'", "'+msg.author.username+'");';
//                 	dh.mysqlQuery(mysql, query, function(err, all) {
//                 	    return (all)
//               		});
//               		}
//                  ).catch(console.error);
// 		     			

/*
well on initializing your client you set client.var = null;
then on updating that you could set it to something by .broadcastEval(this.var = "hello world")
I use that in a bit different way to reload some files for each client
*/

		     	//if (!debug){
//   		        var myVar = "Hello World";
// 		     	
// 				bot.shard.broadcastEval(this.myvar = myVar).then(
//           			results => console.log(results),
//           			err => console.log(err)
//         		);
//         		
//  				bot.shard.broadcastEval("console.log(this.shard.fetchClientValues('myvar'))").then(
//           			results => console.log(results),
//           			err => console.log(err)
//         		);       		
        		
		     //	bot.shard.broadcast( mh.send(msg, subtext, options) );
		     		//bot.shard.broadcastEval("this.shard.fetchClientValues('myVar').then( (results) => { mh.send(msg, subtext, options) ).catch(console.error)";
		     	//}
		//     }
		  //  }
// 		})
// 	       
// })

};

// testing: https://woeler.eu/test/discord.php
