module.exports = (msg, type, fs, logfile, bot) => {
	
	var requesttext = ""
	
	if (msg.guild){requesttext = msg.guild.name}else{
	requesttext = "unknown guild"}
	
	requesttext +  "\t"
	
	if (msg.author){requesttext += msg.author.username}else{
	requesttext += "unknown author"}	

	requesttext += "\t" + type
	
	if (msg.createdAt){requesttext += msg.createdAt}else{
	requesttext += "unknown time"}	
		
//	var requesttext = tmp +  "\t" +  tmp2 + "\t" + type + "\t" + msg.createdAt;
	console.log(requesttext);
	var requesttext = requesttext + "\n" ;
	fs.appendFile(logfile, requesttext , function (err) {});
	
	bot.channels.get("301074654301388800").sendMessage(requesttext)

};