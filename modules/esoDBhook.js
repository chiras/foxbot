const Promise = require('bluebird');

const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")

var request = Promise.promisifyAll(require('request'));

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

const distributors = {
	"ESO-Database.com" : 1,
	"Fox" : 3,
	"the Undaunted Quartermaster" : 2,
	"The Watcher" : 1
}

const distributor_icons = {
	"ESO-Database.com" : "",
	"Fox" : "",
	"the Undaunted Quartermaster" : "http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png"
}




function getDbRecords(mysql, callback) {

var query = "SELECT settingsid, value, settingstype FROM guilds_settings WHERE setting = '-sub'"

dh.mysqlQuery(mysql, query, function(err,all) {
    		callback(err, all)
    	})
};


module.exports = (bot, msg, options, mysql, Discord) => {

if (msg.content.startsWith("!")){
	return;	
}

	var notitype = Number(distributors[msg.author.username])
	var subtext = mh.prepare(Discord);

    subtext.setAuthor("Announcement from "+ msg.author.username)
    subtext.setDescription(msg.content)

    
var p2 = new Promise(function(resolve, reject) {
	getDbRecords(mysql, function(err, obj) {
        resolve(obj);
	})
}).then(function(channels){
	     
	     channels.forEach(function(channel){
	     	 var subscription = channel.settingsid
	     	 var type =channel.settingstype
	     	 var value =channel.value		     
		     
		     if (value == notitype){
		     	options["rechannelid"] = subscription;
		     if (type == "channel"){
		     		options["rechannel"] = "announceChannel";
		     }

		     if (type == "user") {
		     		options["rechannel"] = "announceUser";
		     
		     }
		     
		     mh.send(msg, subtext, options)
		     }
		     })
	       
})

};

// testing: https://woeler.eu/test/discord.php