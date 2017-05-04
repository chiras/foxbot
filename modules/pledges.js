const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const moment = require('moment-timezone');
const nh = require("../data/name_helper.js")

const resetTime = '2:00am';
const resetZone = 'America/New_York';
const baseTimestamp = 1475301600;
const baseDoW = 6 //2016-02-01 is Monday (0 - Sun, 1 - Mon, 2 - Tue, 3 - Wed, 4 - Thu, 5 - Fri, 6 - Sat)
const Maj = 0;
const Glirion = 1;
const Urgalag = 2;


function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}
    
module.exports = (bot, msg, request, cheerio, Discord) => {

	// this time calculation has been taken from Seri's code
    let elapsed = moment().unix() - baseTimestamp;
    let diff = Math.floor(elapsed / 86400) + 1;
    var remainingH = 23 - Math.floor((elapsed % 86400) / 3600);
    var remainingM = 59 - Math.floor(((elapsed % 86400) / 60) % 60);
    
    var baserURL = "https://www.esoleaderboards.com/api/api.php?callType=getPledge&pledgeType="
    var dayURL = "&daysFromNow=1"
    
    var questgiver = {"Maj al-Ragath" : 1, "Glirion the Redbeard" : 2, "Urgarlag Chief-Bane" : 3};
    var pledgeAPI = [	baserURL + questgiver["Maj al-Ragath"], 
    					baserURL + questgiver["Glirion the Redbeard"], 
    					baserURL + questgiver["Urgarlag Chief-Bane"],
    					baserURL + questgiver["Maj al-Ragath"]+dayURL, 
    					baserURL + questgiver["Glirion the Redbeard"]+dayURL, 
    					baserURL + questgiver["Urgarlag Chief-Bane"]+dayURL
    					];

    var pledgeText = "";

    var promise = Promise.resolve(3);
	var embed = new Discord.RichEmbed()
    embed.setAuthor("Undaunted Quartermaster Ilmeni Arelas","http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
    embed.setColor(0x800000)
   	embed.setFooter('Data obtained from www.esoleaderboards.com')
//   	embed.setThumbnail('http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png')
  
    Promise.map(pledgeAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
            for (var i = 0; i < 3; i++) {
                pledgeText += "* " + nh.linkify(articles[i].body) + " (by " + Object.keys(questgiver)[i] + ")\n"; //, tomorrow: [" + articles[i+3].body + "](" + baseurluesp + pledges[articles[i+3].body] + ") )\n";

            }

			embed.addField("Today's pledges are",pledgeText)

            pledgeText = "";
            
            for (var i = 0; i < 3; i++) {
                pledgeText += nh.linkify(articles[i+3].body) + ", ";

            }
            
            pledgeText = pledgeText.slice(0, -2);          
            pledgeText += " in " + remainingH +" hours and " + remainingM + " minutes.";
			embed.addField("Next pledges will be ",pledgeText)

           	//.setDescription(msg.content)
			
			msg.channel.sendEmbed(embed);
      
//             msg.channel.sendEmbed({
//                 color: 0x800000,
//                 fields: [{
//                     name: "Today's pledges are" ,
//                     value: pledgeText
//                 }],
//                 footer: {
//                     text: 'Data obtained from www.esoleaderboards.com'
//                 }
//             });
        })
        .catch(function(e) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "There was a connection error, please try again later.",
            });
            console.log(e)
        })

//    //  before API
//     var pledgeurl = "https://esoleaderboards.com/api/getpledges.php"
//     var pledgetimeurl = "https://esoleaderboards.com"
// 	
// 
// 	
//     request({
//         url: pledgeurl,
//         json: true
//     }, function(error, response, body) {
// 
//         if (!error && response.statusCode === 200) {
//             var pledgetext = "Pledges today are: [" + JSON.stringify(body[1]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[1]).replace(/\"/g, "")] +"), ["
//                 pledgetext +=  JSON.stringify(body[2]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[2]).replace(/\"/g, "")] +") and [" 
//                 pledgetext +=  JSON.stringify(body[3]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[3]).replace(/\"/g, "")] +").";
// 
//          	msg.channel.sendEmbed({
//   				color: 0x800000,
//   				description: pledgetext,
// 			});		
// 
//         }else{
//           msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );
// 
//         }
//     })
// 
//     request(pledgetimeurl, function(error, response, body) {
//         if (error) {
//             msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );
// 
//             console.log("Error: " + error);
//         }else{
// 
//         if (response.statusCode === 200) {
//             var $ = cheerio.load(body);
//         }
//         $('p[class="type"]')
//             .each(function() {
//                 var $el = $(this);
//                 if ($(this).text().substring(0, 5) == " Next") {
//          	msg.channel.sendEmbed({
//   				color: 0x800000,
//   				description: $(this).text(),
//   				footer: {
// 			      text: 'Data obtained from www.esoleaderboards.com' 
//     			}
// 			});		
//                 }
//             });
//         }
// 
//     });
//     
};
