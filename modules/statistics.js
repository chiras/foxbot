

module.exports = (bot, msg, setitems) => {


};

//# number requests
// wli7055:logs alexanderkeller$ wc 2017-05-03.txt
//     4244   62593  558735 2017-05-03.txt


//# guild 
//cut -f1 -d$'\t' 2017-05-03.txt | sed "s/^2017.*2092> //" | sort | uniq -c | wc
// 105

//top guild 
//cut -f1 -d$'\t' 2017-05-03.txt | sed "s/^2017.*2092> //" | sort | uniq -c | sort  | tail -n 12
// wli7055:logs alexanderkeller$ cut -f1 -d$'\t' 2017-05-03.txt | sed "s/^2017.*2092> //" | sort | uniq -c | sort  | tail -n 12
//   87 Venator Phalanx
//  101 Lone Wolf Help
//  106 Malicious Lemontarts
//  114 The Divine Pantheon 18+
//  125 Shrouded Light
//  146 Nightfighters Official Discord
//  158 Red Crusade
//  164 Blindside
//  164 Moonlight Travelers
//  206 Nobheads

// Direct messages 
//  211 unknown guild


//top commands
// wli7055:logs alexanderkeller$ cut -f3 -d$'\t' 2017-05-03.txt | sed "s/[[:space:]].*$//" | sort | uniq -c | sort | tail -n 11

68,120,130,206,221,295,316,505,734,809,

{"commands" : 	{
				"names" : "|!youtube|!trials|!luxury|!status|!poll|!golden|!help|!lb|!pledges|!set|",
				"counts": "68,120,130,206,221,295,316,505,734,809"
				},
"guilds" : 	{
				"names" : "|Venator Phalanx|Lone Wolf Help|Malicious Lemontarts|The Divine Pantheon 18+|Shrouded Light|Nightfighters Official Discord|Red Crusade|Blindside|Moonlight Travelers|Nobheads|Direct Messages",
				"counts": "87,101,106,114,125,146,158,164,164,206,211"
				},
}

// reverse ids
var image = "https://chart.googleapis.com/chart?cht=bhs&chs=400x370&chd=t:"+"&chxl=0:|0|"+"|1:"+"&chds=a&chco=4D89F9,C6D9FD&chxt=x,y&chf=bg,s,32363c&chxs=0,ffffff,14|1,ffffff,14";
var image = "https://chart.googleapis.com/chart?cht=bhs&chs=400x370&chd=t:"+"&chxl=0:|0|"+"|1:"+"&chds=a&chco=4D89F9,C6D9FD&chxt=x,y&chf=bg,s,32363c&chxs=0,ffffff,14|1,ffffff,14";


image=image.replace(/ /g, "%20")
				            		
const embed = new Discord.RichEmbed()
 				  	.setTitle(ongoingPolls[curChannel].question)
  				 //	.setAuthor('Author Name', 'https://i.imgur.com/lm8s41J.png')
  					.setColor(0x800000)
    				.setDescription("Poll has been ended ("+winTxt +"):\n"  + endTxt + "\n\nThe poll has been deleted from this channel.")
    				.setImage(image)


  				msg.channel.sendEmbed(embed);          		
            				