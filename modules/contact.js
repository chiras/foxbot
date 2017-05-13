module.exports = (bot, msg) => {
    let [message] = msg.content.split(" ").slice(1);
    
		var contactmsg = "Please contact <@218803587491299328> (Fox#6800) or ingame (EU/PC) @chi-ras directly for requests about the discord bot!\n\n";
		
		contactmsg += "Golden/Luxury info: <http://www.benevolentbowd.ca>\n";
		contactmsg += "Pledges info: <http://www.esoleaderboards.com>\n";
		contactmsg += "Maintainance/Patchnotes: <http://www.forums.elderscrollsonline.com>";
			
        msg.channel.sendMessage(contactmsg);

};