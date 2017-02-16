module.exports = (msg, type, fs, logfile) => {
	
	var requesttext = msg.guild.name +  "\t" +  msg.author.username + "\t" + type + "\t" + msg.createdAt ;
	fs.appendFile(logfile, requesttext, function (err) {});
	console.log(requesttext);
};