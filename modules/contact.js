module.exports = (bot, msg) => {
    let [message] = msg.content.split(" ").slice(1);
    
		var contactmsg = "Please contact <@218803587491299328> or ingame (EU/PC) @chi-ras directly for requests about the discord bot!\n\n";
		
		contactmsg += "Golden/Luxury info: benevolentbowd.ca\n";
		contactmsg += "Pledges info: esoleaderboards.com\n";
		contactmsg += "Maintainance info: forums.elderscrollsonline.com";
			
        msg.channel.sendMessage(contactmsg);

};