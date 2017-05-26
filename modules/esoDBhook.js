const util = require('util')
const sqlite3 = require('sqlite3').verbose(); // db module
const Promise = require('bluebird');
const mh = require("../helper/messages.js")

var request = Promise.promisifyAll(require('request'));

var dbguilds = new sqlite3.Database('./data/dbs/guilds.db'); // database file

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

const distributors = {
	"ESO-Database.com" : "news",
	"Fox" : "bot",
	"the Undaunted Quartermaster" : "regular",
	"The Watcher" : "else"
}

const distributor_icons = {
	"ESO-Database.com" : "",
	"Fox" : "",
	"the Undaunted Quartermaster" : "http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png"
}

const bit4 = {
	 "news" 	: "0",
	 "bot" 		: "1",
	 "regular" 	: "2",
	 "else" 	: "3"
	}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// notification encoding: 4-bit -> 1110 to 0000 --> 15 to 0

    var ConvertBase = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return pad(parseInt(num, baseFrom).toString(baseTo),4);
                    }
                };
            }
        };
    };
    
    ConvertBase.dec2bin = function (num) {
        return ConvertBase(num).from(10).to(2);
    };
    
    ConvertBase.bin2dec = function (num) {
        return ConvertBase(num).from(2).to(10);
    };

function getDbRecords(db, callback) {
db.serialize(function() {
    db.all("SELECT noti_channel, noti_type FROM settings", function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
});
};


module.exports = (bot, msg, Discord) => {

if (msg.content.startsWith("!")){
	return;	
}
	var subtext = mh.prepare(Discord);

    subtext.setAuthor("Announcement from "+ msg.author.username)
    subtext.setDescription(msg.content)

    
var p2 = new Promise(function(resolve, reject) {
	getDbRecords(dbguilds, function(err, obj) {
        resolve(obj);
	})
}).then(function(channels){
		console.log(msg.author.username)
	     
	     channels.forEach(function(channel){
	     	 var subscriptions = ConvertBase.dec2bin(channel.noti_type)
	     	 var type = Number(bit4[distributors[msg.author.username]])
	     	 var subbed = Number(subscriptions.substr(type,1))
	     	 
		     console.log(channel.noti_channel+"-->"+subscriptions+"-->"+type); 
			 
		     if(subbed){
   			 	mh.send(bot.channels.get(channel.noti_channel), subtext)
		     	console.log("YEEEESSSS "+subbed)
		     }else{
		     	console.log("NOOOO "+subbed)
		     }
		     
	     })
	       
})

};

// testing: https://woeler.eu/test/discord.php