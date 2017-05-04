const Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var jsonfile = require('jsonfile')
var file = './data/subsdump.json'

var data = {};
jsonfile.readFile(file, function(err, obj) {
        data = obj;
})

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

module.exports = (bot, msg, Discord) => {

if (msg.content.startsWith("!")){
	return;	
}
    
var p2 = new Promise(function(resolve, reject) {
	jsonfile.readFile(file, function(err, obj) {
        resolve(obj);
	})

}).then(function(value){
  //      console.log("ongoing"); 
   //     console.log(value); 

        var subchannels = []


        for (i = 0; i < Object.keys(value).length; i++) {
            var channel = Object.keys(value)[i]
//            console.log(channel)
            if (value[channel] != "none") {
            if (distributors[msg.author.username] == value[channel] | value[channel] == "all"){
                subchannels.push(channel);
            }
            }

        }
        return subchannels;

}).then(function(value){
 //  console.log(value); // 2

        var embed = new Discord.RichEmbed()
            .setAuthor("Announcement from "+ msg.author.username)
            .setColor(0x800000)
            .setDescription(msg.content)

        for (i = 0; i < value.length; i++) {
            bot.channels.get(value[i]).sendEmbed(embed);
        }
});

};

// testing: https://woeler.eu/test/discord.php