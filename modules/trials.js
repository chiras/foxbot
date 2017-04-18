var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

function processFeed(feed) { 
    // use the promisified version of 'get'
    return request.getAsync(feed)
}

module.exports = (bot, msg, request, cheerio, util) => {
	
	var baserURL = "https://www.esoleaderboards.com/api/api.php?callType=getWeeklyTrial&megaserver="
	var servers = ["EU","NA"]
	var trialAPI = [baserURL+servers[0], baserURL+servers[1]];
	
	//var trials = processAllFeeds(trialAPI);
	
	var trialText = "";
	
	var promise = Promise.resolve(3);
		Promise.map(trialAPI, function(feed){        
       		return processFeed(feed) 
    	})
  	    .then(function(articles){
			for (var i = 0; i < 2; i++){
				trialText += "* " + articles[i].body + " ("+ servers[i]+")"+"\n";    
			
			}                
    			msg.channel.sendEmbed({
  					color: 0x800000,
  					title: "This week's special trials are",
  					description: trialText,
                footer: {
                    text: 'Data obtained from www.esoleaderboards.com'
                }
				});	 
    })
    .catch(function(e){
    			msg.channel.sendEmbed({
  					color: 0x800000,
  					description: "There was a connection error, please try again later.",
				});	 
    })
	


	
 //    var trialurl = "https://esoleaderboards.com/api/getweeklies.php"
//     var weeklytrials = [];
// 
//     var baseurluesp = "http://en.uesp.net"
//     var trials = {
//         "Aetherian Archive": "/wiki/Online:Aetherian_Archive",
//         "Hel Ra Citadel": "/wiki/Online:Hel_Ra_Citadel",
//         "Sanctum Ophidia": "/wiki/Online:Sanctum_Ophidia",
//         "Maw of Lorkhaj": "/wiki/Online:Maw_of_Lorkhaj",
//     };
// 
//     request({
//         url: trialurl,
//         json: true
//     }, function(error, response, body) {
//     
//  //       console.log(util.inspect(body))
// 
//         if (!error && response.statusCode === 200) {
//  //            var pledgetext = "Pledges today are: [" + JSON.stringify(body[1]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[1]).replace(/\"/g, "")] +"), ["
// //                 pledgetext +=  JSON.stringify(body[2]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[2]).replace(/\"/g, "")] +") " 
// 
//  
//             var trialText = "This week's special trials are [" + JSON.stringify(body["EU"]).replace(/\"/g, "") + "](" + baseurl + trials[JSON.stringify(body["EU"]).replace(/\"/g, "")] + ") (EU) and [" + JSON.stringify(body["NA"]).replace(/\"/g, "") + "](" + baseurluesp + trials[JSON.stringify(body["NA"]).replace(/\"/g, "")] + ") (US)";
// 
//          	msg.channel.sendEmbed({
//   				color: 0x800000,
//   				description: trialText,
// 			});		
//  
// 
//         }else{
//           msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );
// 
//         }
//     })

// Before API

//     request(trialurl, function(error, response, body) {
//         if (error) {
//             msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
//             console.log("Error: " + error);
//         } else {
// 
//             if (response.statusCode === 200) {
//                 var $ = cheerio.load(body);
//             }
// 
//             $('tr[class="header"]').find('th > p ').filter(function() {
//                 return $(this).text().trim() === "Weekly Trials";
//             }).parentsUntil('tr[class="header"]').next().next().children('td').children('strong').each(function() {
//                 weeklytrials.push($(this).text().trim());
// 
//             });
// 
// 
//             var trialText = "This week's special trials are [" + weeklytrials[0] + "](" + baseurl + trials[weeklytrials[0]] + ") (EU) and [" + weeklytrials[1] + "](" + baseurl + trials[weeklytrials[1]] + ") (US)";
//             msg.channel.sendEmbed({
//                 color: 0x800000,
//                 description: trialText,
//                 footer: {
//                     text: 'Data obtained from www.esoleaderboards.com'
//                 }
//             });
// 
// 
//         }
//     });

};


