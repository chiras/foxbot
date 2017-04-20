const moment = require('moment-timezone');

module.exports = (bot, msg, db) => {

var filter = msg.content.split(" ").slice(1)
var timepoint = moment().unix();
	
db.each("INSERT into lfg(name, searching, time) VALUES ('"+ msg.author.username +"', '"+filter+"', '"+ timepoint+ "')", function(err, row) {
});
 

//     msg.channel.sendEmbed({
//   				color: 0x800000,
//   				description: ,
// 	});	

};