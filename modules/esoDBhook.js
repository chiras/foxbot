module.exports = (bot, msg, Discord) => {

var subchannels = ["254216677196169216"]



const embed = new Discord.RichEmbed()
  .setAuthor(msg.author.username)
  .setColor(0x800000)
  .setDescription(msg.content)

for (i = 0; i < subchannels.length; i++){
	bot.channels.get(subchannels[i]).sendEmbed(embed);
}
		
		
	//bot.channels.get("254216677196169216").sendMessage(msg.content)
	
};