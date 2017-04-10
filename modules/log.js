module.exports = (msg, type, fs, logfile, bot) => {
	
	var requesttext = msg.guild.name +  "\t" +  msg.author.username + "\t" + type + "\t" + msg.createdAt;
	console.log(requesttext);
	var requesttext = requesttext + "\n" ;
	fs.appendFile(logfile, requesttext , function (err) {});
	
	bot.channels.get("301074654301388800").sendMessage(requesttext)

};