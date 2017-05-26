const util = require('util')
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/dbs/guilds.db');

function getDbRecords(args, callback) {
    db.all("SELECT * FROM channels WHERE " + args, function(err, all) {
        if (err){console.log(err)};
        callback(err, all);  
    });
}; 

// function logMapElements(value, key, map, callback) {
// 	var roles = `${value}`
//     console.log(`m[${key}] = ${value}`);
//     callback(roles);
// }

function getDbInserts(args, callback) {
	
getDbMaxId(db, function(err, all) { 
	var day = Number(all[0]['MAX(dateid)'])+1;

	db.each("INSERT into golden (dateid, date, item) VALUES ('"+day+"', '"+args[0]+"', '"+args[1]+"')", function(err, row) {
		if (err){
			console.log(err)
		}else{

		}	
	});
	
})
}; 


exports.getGuildRoles = function(msg, callback) {
	var roles =  [ ...msg.guild.roles.keys() ]
	var rolehash = {}
	
	for (var i = 0; i < roles.length; i++){
		rolehash[roles[i]] = msg.guild.roles.get(roles[i]).name
		console.log(i +" "+roles[i] + "-->" +  msg.guild.roles.get(roles[i]).name)
	}
	callback(rolehash)
}; 

exports.setGuildRoles = function(Discord, callback) {
	console.log("Guild Roles updated");
	
	
}; 
