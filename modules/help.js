module.exports = (bot, msg, setitems) => {

    var eventinfo = "**!pledges**      -> Today's Undaunted pledges\n";
    eventinfo += "**!trials**      -> This weeks's special trials\n";

    var weekendinfo = "**!golden**      -> Cyrodiil's Golden Vendor Items\n";
    weekendinfo += "**!luxury**      -> Luxury Housing Vendor Items\n";

    var offinfo = "**!status**      -> ESO server status\n";
    offinfo += "**!patch**      -> Latest ESO patch notes\n";
    offinfo += "**!patchpts**      -> PTS (Morrowind) patch notes\n";

    var iteminfo = " **!set SETNAME**      -> Set item information (e.g. !set skel)\n";
     iteminfo += "**!lb** -> Leaderboard scores (e.g. !lb @account, EU, HRC)\n";

    var grouptools = " **!poll**      -> Start a poll, vote and end it\n";

    var mediainfo = "**!youtube**      -> Hot and new ESO videos\n";
    mediainfo += "**!twitch**      -> Current top 5 ESO streams\n";

    var botinfo = "**!contact**      -> Contact information for the Bot author\n";
    botinfo += "**!help**      -> This help page\n";
    
    msg.channel.sendEmbed({
  			color: 0x800000,
  		//	description: helpinfo,
  			fields: [{
       			 name: 'Regular Events',
       			 value: eventinfo
     		 },
     		 {
       			 name: 'Weekend Vendors',
       			 value: weekendinfo
			},
      		{
      			 name: 'Game Information',
        		 value: iteminfo
      		},
      		{
      			 name: 'Group Tools',
        		 value: grouptools
      		},
      		{
      			 name: 'Official Information',
        		 value: offinfo
      		},
      		{
      			 name: 'Media',
        		 value: mediainfo
      		},
      		{
      			 name: 'Bot',
        		 value: botinfo
      		}
    		]
		});
		
};