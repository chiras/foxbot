const Promise = require('bluebird');

const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")

var request = Promise.promisifyAll(require('request'));

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

const distributors = {
	"ESO-Database.com" : 0,
	"Fox" : 2,
	"the Undaunted Quartermaster" : 1,
	"The Watcher" : 0,
	"Adhazabi Aba-daro" : 1, 
	"Zenil Theran" : 1 
}

const distributor_icons = {
	"ESO-Database.com" : "",
	"Fox" : "",
	"the Undaunted Quartermaster" : "http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png"
}

function getDbRecords(mysql, callback) {

var query = "SELECT settingsid, value, settingstype,sap FROM guilds_settings WHERE setting = '-sub'"

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
	     	 var subscription = channel.sap
	     	 var type =channel.settingstype
	     	 var value = channel.value		     
		     
		     if (value == notitype){
		     	options["rechannelid"] = subscription;
		     	options["rechannel"] = "announceChannel";
		     	mh.send(msg, subtext, options)
		     }
		})
	       
})

};

// testing: https://woeler.eu/test/discord.php