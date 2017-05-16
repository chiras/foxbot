

exports.prepare = function(Discord, callback) {
    var embed = new Discord.RichEmbed()	
  		.setColor(0x800000)

    return embed;	
}; 

exports.send = function(channel, embed, callback) {

    channel.send({embed: embed});	
    
}; 