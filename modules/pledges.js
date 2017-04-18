//     function httpGet(url, callback) {
//         const options = {
//             url: url,
//             json: true
//         };
//         request(options,
//             function(err, res, body) {
//                 callback(err, body);
//             }
//         );
//     }
//     
    
module.exports = (bot, msg, request, cheerio) => {

// const async = require('async');
//     
// 
//     var urls = [];
//     var pledges = [];
//     
//     for (var i = 1; i <= 3; i++ ){
// 		request({
//         	url: "https://www.esoleaderboards.com/api/api.php?callType=getPledge&pledgeType="+i+"&daysFromNow=0",
//         	json: true
//     	}, function(error, response, body) {
//     	        if (!error && response.statusCode === 200) {
// 				console.log(body)
//     			urls[i] = JSON.stringify(body[1]).replace(/\"/g, "")
//     		}}
//     		);
// 	}
// 
//     async.map(urls, httpGet, function(err, body) {
//         if (err) {
//             msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
//             return console.log(err);
//         } else {
//             //console.log(body);
// 
// 		console.log(body)
// 
// 
//         }
// 
//     });
// 
// // 	var pledgesAPI = "https://www.esoleaderboards.com/api/api.php"
// // 	// https://www.esoleaderboards.com/api/api.php?callType=getPledge&pledgeType=1&daysFromNow=0
// // 	
// // 	var pledges=[];
// // 	
// 
// // 
//  	console.log(pledges);
	
    var pledgeurl = "https://esoleaderboards.com/api/getpledges.php"
    var pledgetimeurl = "https://esoleaderboards.com"
	
	var baseurl = "http://en.uesp.net"
	var pledges = {
		"The Banished Cells I" : "/wiki/Online:The_Banished_Cells_I",
		"The Banished Cells II" : "/wiki/Online:The_Banished_Cells_II",
		"Elden Hollow I" : "/wiki/Online:Elden_Hollow_I",
		"Elden Hollow II" : "/wiki/Online:Elden_Hollow_II",
		"City of Ash I" : "/wiki/Online:City_of_Ash_I",
		"City of Ash II" : "/wiki/Online:City_of_Ash_II",
		"Tempest Island" : "/wiki/Online:Tempest_Island",
		"Selene's Web" : "/wiki/Online:Selene%27s_Web",
		"Volenfell" : "/wiki/Online:Volenfell",
		"Blackheart Haven" : "/wiki/Online:Blackheart_Haven",
		"Spindleclutch I" : "/wiki/Online:Spindleclutch_I",
		"Spindleclutch II" : "/wiki/Online:Spindleclutch_II",
		"Crypt of Hearts I" : "/wiki/Online:Crypt_of_Hearts_I",
		"Crypt of Hearts II" : "/wiki/Online:Crypt_of_Hearts_II",
		"Wayrest Sewers I" : "/wiki/Online:Wayrest_Sewers_I",
		"Wayrest Sewers II" : "/wiki/Online:Wayrest_Sewers_II",
		"Darkshade Caverns I" : "/wiki/Online:Darkshade_Caverns_I",
		"Darkshade Caverns II" : "/wiki/Online:Darkshade_Caverns_II",
		"Direfrost Keep" : "/wiki/Online:Direfrost_Keep",
		"Blessed Crucible" : "/wiki/Online:Blessed_Crucible",
		"Arx Corinium" : "/wiki/Online:Arx_Corinium",
		"Cradle of Shadows" : "/wiki/Online:Cradle_of_Shadows",
		"Ruins of Mazzatun" : "/wiki/Online:Ruins_of_Mazzatun",
		"Fungal Grotto I" : "/wiki/Online:Fungal_Grotto_I",
		"Fungal Grotto II" : "/wiki/Online:Fungal_Grotto_II",
		"Vaults of Madness" : "/wiki/Online:Vaults_of_Madness",
		"White-Gold Tower" : "/wiki/Online:White-Gold_Tower",
		"Imperial City Prison" : "/wiki/Online:Imperial_City_Prison"
		};
	
    request({
        url: pledgeurl,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            var pledgetext = "Pledges today are: [" + JSON.stringify(body[1]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[1]).replace(/\"/g, "")] +"), ["
                pledgetext +=  JSON.stringify(body[2]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[2]).replace(/\"/g, "")] +") and [" 
                pledgetext +=  JSON.stringify(body[3]).replace(/\"/g, "") + "](" + baseurl + pledges[JSON.stringify(body[3]).replace(/\"/g, "")] +").";

         	msg.channel.sendEmbed({
  				color: 0x800000,
  				description: pledgetext,
			});		

        }else{
          msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );

        }
    })

    request(pledgetimeurl, function(error, response, body) {
        if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );

            console.log("Error: " + error);
        }else{

        if (response.statusCode === 200) {
            var $ = cheerio.load(body);
        }
        $('p[class="type"]')
            .each(function() {
                var $el = $(this);
                if ($(this).text().substring(0, 5) == " Next") {
         	msg.channel.sendEmbed({
  				color: 0x800000,
  				description: $(this).text(),
  				footer: {
			      text: 'Data obtained from www.esoleaderboards.com' 
    			}
			});		
                }
            });
        }

    });
    
};
