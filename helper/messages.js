

exports.prepare = function(Discord, callback) {
    var embed = new Discord.RichEmbed()	
  		.setColor(0x800000)

    return embed;	
}; 

exports.send = function(where, embed, msg, callback) {
	if (where.channel){
		console.log("1")
	    where.channel.send({embed: embed});	
	}else{
	console.log("2" + where)
	   where.send({embed: embed});	
	}
    
}; 