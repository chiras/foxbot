module.exports = (bot, msg, request, cheerio, util) => {

    var trialurl = "https://esoleaderboards.com"
	var weeklytrials = [];
	
    request(trialurl, function(error, response, body) {
        if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );
            console.log("Error: " + error);
        }else{

        if (response.statusCode === 200) {
            var $ = cheerio.load(body);
        }
	//	console.log(util.inspect($(this)));

        $('tr[class="header"]').find('th > p ').filter(function() {
  							return $(this).text().trim() === "Weekly Trials" ;
  						}).parentsUntil('tr[class="header"]').next().next().children('td').children('strong').each(function() {
  								weeklytrials.push($(this).text().trim());
							//	console.log($(this).text().trim());

  						});


         //    .each(function() {
//                 var $el = $(this);
//                 if ($(this).text().substring(0, 5) == " Next") {
//                     msg.channel.sendMessage($(this).text());
//                 }
            //}
           // );

    var trialText = "This week's special trials are " + weeklytrials[0] + " (EU) and "  + weeklytrials[1] + " (US)" ;
         	msg.channel.sendEmbed({
  				color: 0x800000,
  				description: trialText,
  				footer: {
			      text: 'Data obtained from www.esoleaderboards.com' 
    			}
			});		
	
	
	}
    });

};


// 
//                 <tr class='header'>
//                   <th colspan='4' style='font-size: 15px;  color: #FFF; text-align: center; padding: 20px;'>   <p class='type' align='center'>  Weekly Trials </p> </th>
//                 </tr>
//                 <tr class='header'>
// 
//                   <th scope='col' style='font-size: 15px; text-align: center; padding: 20px;' colspan='2'> EU Megaserver </th>
// 
// 
//                   <th scope='col' style='font-size: 15px; text-align: center; padding: 20px;' colspan='2'> NA Megaserver </th></tr>
// 
//                 <!-- NEW ROW-->
//                 <tr class='row1' >
//                   <td class='normal' style='font-size:20px; text-align: center; padding: 10px;' width='50%' colspan='2'><strong>Aetherian Archive</strong></br> <a href='trial_sample.php?trial=weekly'><img src='img/aa.png' width='200px''></a>
// 
//                   </td>
//                   <td class='normal' style='font-size:20px; text-align: center;' width='50%' colspan='2'><strong>Sanctum Ophidia</strong></br><a href='trial_sample.php?trial=weekly'><img src='img/so.png' width='200px''></a>
// 
