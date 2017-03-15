module.exports = (bot, msg, setitems) => {
	var helpinfo = "";
	helpinfo += "Available options:\n";
    helpinfo += "\n### Daily Events ###\n";
    helpinfo += " **!pledges** -> Today's Undaunted Pledges\n";
    helpinfo += "\n### Weekend Events ###\n";
    helpinfo += " **!golden** -> Cyrodiil's Golden Vendor Items\n";
    helpinfo += " **!luxury** -> Luxury Housing Vendor Items\n";
    helpinfo += "\n### Useful game information ###\n"; 
    helpinfo += " **!status** -> ESO Server Status\n";
    helpinfo += " **!set SETNAME** -> Set item information (e.g. !set skel)\n";
    helpinfo += "\n### Media ###\n"; 
    helpinfo += " **!youtube** -> Current top 5 ESO videos\n";
    helpinfo += " **!twitch** -> Current top 5 ESO streams\n";
    helpinfo += "\n### Discord Bot ###\n"; 
    helpinfo += " **!contact** -> Contact information for the Bot author\n";
    
    msg.channel.sendMessage(helpinfo);

};