const sqlite3 = require('sqlite3').verbose(); // db module
var schedule = require('node-schedule'); // might be good to schedule a regular data update?

var dbttc = new sqlite3.Database('./data/dbs/ttc.db'); // database file

var quality = {
	0 : "white",
	1 : "green",
	2 : "blue",
	3 : "purple",
	4 : "yellow"
}
var traits = {
	0 : "powered",
	1 : "charged",
	2 : "precise",
	3 : "infused",
	4 : "defending",
	5 : "training",
	6 : "sharpened",
	7 : "decisive"
}


// These are the functions use for the golden. Need to adapt to your db then.
function getDbRecords(db, table, args, callback) {
    db.all("SELECT * FROM "+table+" WHERE " + args, function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all, args);
    });
};


function argumentSlicer(text, callback){
	var tmp = text.split(" ").slice(1).join(" ").replace(/ /g, /,/).split(",")
	
	
}

// Here the module export begins
module.exports = (bot, msg, Discord) => { // these arguments must be passed through the main 


	getDbRecords(dbttc, "items", "name == 'inferno staff of the sun'",function(err, all){
		console.log(all)
		
		all.forEach(function(item){
			getDbRecords(dbttc, "prices", "id == '"+item.id+"'",function(err, prices){
			prices.forEach(function(price){
				console.log(price["level"]+"/"+quality[price["quality"]]+"/"+traits[price["trait"]]+"/"+price["avg"])
			})		
		})		
		
		})
		
		
	})

// 
//     // set up the final message framework
//     var embed = new Discord.RichEmbed()
//     embed.setAuthor("Adhazabi Aba-daro the Golden says") //,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
//     embed.setColor(0x800000)
//     embed.setColor(0x800000)
//     embed.setFooter("Obtained from http://www.tamrieltradecentre.com")
// 
// 
//     // message content
//     embed.addField("Title", "Text")
//     msg.channel.sendEmbed(embed);

};


// https://eu.tamrieltradecentre.com/Download/PriceTable