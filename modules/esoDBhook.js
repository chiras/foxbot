const util = require('util')
const sqlite3 = require('sqlite3').verbose(); // db module
const Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

var dbguilds = new sqlite3.Database('./data/guilds.db'); // database file

var notiNames = {	"news" : "latest ESO news", "regular" : "regular Events", "bot" : "major Bot updates"}

const distributors = {
	"ESO-Database.com" : "news",
	"Fox" : "bot",
	"Undaunted Quartermaster Ilmeni Arelas" : "regular"
}

const distributor_icons = {
	"ESO-Database.com" : "",
	"Fox" : "",
	"Undaunted Quartermaster Ilmeni Arelas" : "http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png"
}


// notification encoding: 4-bit
/**
    var ConvertBase = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
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
**/

function getDbRecords(db, callback) {
db.serialize(function() {
    db.all("SELECT * FROM subscription", function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all);
    });
});
};


module.exports = (bot, msg, Discord) => {

if (msg.content.startsWith("!")){
	return;	
}

        var embed = new Discord.RichEmbed()
            .setAuthor("Announcement from "+ msg.author.username)
            .setColor(0x800000)
            .setDescription(msg.content)

    
var p2 = new Promise(function(resolve, reject) {
	getDbRecords(dbguilds, function(err, obj) {
        resolve(obj);
	})
}).then(function(value){
	     //console.log(value); 
	       
         for (i = 0; i < Object.keys(value).length; i++) {
         	if (value[i][distributors[msg.author.username]]){
         	
             bot.channels.get(value[i].channel).sendEmbed(embed)
  //       		console.log("Pushing " + value[i].guild)
         	}
         }
	       

})

};

// testing: https://woeler.eu/test/discord.php