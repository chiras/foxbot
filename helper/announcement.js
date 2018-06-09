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

const unique = (value, index, self) => {
    return self.indexOf(value) === index;
}

exports.announce = function(mysql, options, bot, Discord, callback) {

	var txt;

	console.log("SHARD: "+bot.shard.id + "/" + bot.options.shardCount);

	dh.getDbData(mysql, 'announcements', {shard: bot.shard.id, announced: 0}, function(openannounces) { 
	
	if  (openannounces.length){
        var query = 'UPDATE announcements SET announced = 1 WHERE shard = '+bot.shard.id+';';
            dh.mysqlQuery(mysql, query, function(err, all) {
            return (all)
        });	 	
        		 			
		openannounces.forEach(function(openannouncement){


		if (openannouncement.announcement.startsWith("!") || openannouncement.announcement=="Hello\nDiscord!"){
			return;	
		}
	
		
//		console.log(openannouncement);
		var notitype = Number(distributors[openannouncement.sender])
		var subtext = mh.prepare(Discord);

    	subtext.setAuthor('Announcement from '+ openannouncement.sender)
    	subtext.setDescription(openannouncement.announcement)
	
		// just for testing purposes
	 /*	var channels = [{settingsid: '306222637460226048', value: '2', settingstype: 'guild',sap: '451835508176322580'},
	 					{settingsid: '306222107094941697', value: '2', settingstype: 'user',sap: '306222107094941697'},
	 					{settingsid: '218803587491299328', value: '2', settingstype: 'user',sap: '218803587491299328'},
	 					{ settingsid: '252014907770404864', value: '2', settingstype: 'guild',sap:'322364525221380098'}]//,];
	 */	

     
var p2 = new Promise(function(resolve, reject) {
		getDbRecords(mysql, function(err, obj) {
	// 		console.log("channels")

		//const obj2 = obj.filter(unique); // to get rid of notitype perhaps in the future?
		
       	resolve(obj);
		})
}).then(function(channels){
		 var users = 0; 
		 var guilds = 0; 

	     channels.forEach(function(channel){

	     	// see if that channel is still accessible to the bot, now covered in messages.js
			//if (typeof bot.channels.get(channel.sap) !== "undefined"){

    	     options['client']  = bot;		     
		     
		     
		     if (channel.value == notitype){
		     	if (channel.settingstype == 'user'){
		     		options['rechannelid'] = channel.settingsid;
		     		options['rechannel']   = 'announceUser'
					if (bot.shard.id == 0){
						mh.send("", subtext, options)
						users = users +1;
					}
		     	}else{
			     	options['rechannelid'] = channel.sap;
			     	options['rechannel'] = 'announceChannel';		     	
		     		mh.send("", subtext, options)
		     		guilds = guilds + 1;
		     	}
		     	
		     	//console.log(options['rechannelid']);
		     	//console.log(options['rechannel']);


			} // notitype yes
		}) // channel.foreach
		      console.log("Announcements from "+ openannouncement.sender+ " send to " + guilds +" guilds and "+ users + " direct users");

		}) // then
     }) // openannounces.foreach
     
     } //if announcements
	}) // db query announces

};