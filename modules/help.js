module.exports = (bot, msg, setitems) => {
	var helpinfo = "";
	helpinfo += "Available options:\n";
    helpinfo += " **!golden** -> Golden Vendor Items\n";
    helpinfo += " **!pledges** -> Today's Pledges\n";
    helpinfo += " **!status** -> ESO Server Status\n";
    helpinfo += " **!set XXXX** -> Set item information (e.g. !set skel)\n";
    helpinfo += " **!twitch** -> Current top 5 ESO streams\n";
    helpinfo += " **!contact** -> Contact information of the Bot author\n";
    
    msg.channel.sendMessage(helpinfo);

};