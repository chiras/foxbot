const sqlite3 = require('sqlite3').verbose(); // db module
var schedule = require('node-schedule'); // might be good to schedule a regular data update?

var db = new sqlite3.Database('./data/DBFILE'); // database file


// These are the functions use for the golden. Need to adapt to your db then.
function getDbRecords(db, args, callback) {
    db.all("SELECT * FROM golden WHERE dateid IS " + args, function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all, args);
    });
};

function getDbInserts(db, args, callback) {
    getDbMaxId(db, function(err, all) {
        db.each("INSERT into golden (dateid, date, item) VALUES ('" + day + "', '" + args[0] + "', '" + args[1] + "')", function(err, row) {
            if (err) {
                console.log(err)
            } else {

            }
        });

    })
};

function getDbMaxId(db, callback) {
	db.all("SELECT MAX(dateid) FROM golden", function(err, all) {
        if (err){console.log(err)};
        callback(err, all);  
    });
}; 

// Here the module export begins
module.exports = (bot, msg, Discord) => { // these arguments must be passed through the main 

    // set up the final message framework
    var embed = new Discord.RichEmbed()
    embed.setAuthor("Adhazabi Aba-daro the Golden says") //,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
    embed.setColor(0x800000)
    embed.setColor(0x800000)
    embed.setFooter("Obtained from http://www.tamrieltradecentre.com")


    // message content
    embed.addField("Title", "Text")
    msg.channel.sendEmbed(embed);

};