module.exports = (bot, msg, setitems) => {
	var helpinfo = "";
 	//helpinfo += "\n\n..................................................................................................."
	helpinfo += "\nAvailable commands are:\n";
 	helpinfo += "..................................................................................................."
    helpinfo += "\n ### **Daily Events ** \n\n";
    helpinfo += " **!pledges** -> Today's Undaunted Pledges\n";
 	helpinfo += "..................................................................................................."
    helpinfo += "\n ### **Weekend Events **\n\n";
    helpinfo += " **!golden** -> Cyrodiil's Golden Vendor Items\n";
    helpinfo += " **!luxury** -> Luxury Housing Vendor Items\n";
 	helpinfo += "..................................................................................................."
    helpinfo += "\n ### **Useful game information **\n\n"; 
    helpinfo += " **!status** -> ESO Server Status\n";
    helpinfo += " **!set SETNAME** -> Set item information (e.g. !set skel)\n";
 	helpinfo += "..................................................................................................."
    helpinfo += "\n ### **Media **\n\n"; 
    helpinfo += " **!youtube** -> Hot and new ESO videos\n";
    helpinfo += " **!twitch** -> Current top 5 ESO streams\n";
 	helpinfo += "..................................................................................................."
    helpinfo += "\n ### **Discord Bot **\n\n"; 
    helpinfo += " **!contact** -> Contact information for the Bot author\n";
 	helpinfo += "..................................................................................................."
    
    msg.channel.sendMessage(helpinfo);

};