module.exports = (bot, msg, gsDayNames, request, cheerio) => {
	function pad(n){return n<10 ? '0'+n : n}

    var luxuryurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-luxury-furnisher-vendor-items/";
   // var dateObj = new Date();
    var luxurytext = "";

	var today = new Date();
	var yesterday = new Date();
	var preyesterday = new Date();
    var dayName = gsDayNames[today.getDay()];

	preyesterday.setDate(today.getDate() - 2); 
	yesterday.setDate(today.getDate() - 1); 
	
	var lookupdates = [	preyesterday.getFullYear() + "-" + pad((preyesterday.getMonth()+1)) + "-" + pad(preyesterday.getDate()),	
						yesterday.getFullYear() + "-" + pad((yesterday.getMonth()+1)) + "-" + pad(yesterday.getDate()),
						today.getFullYear() + "-" + pad((today.getMonth()+1)) + "-" + pad(today.getDate())];
 

//	console.log(yesterday + '/' + today)

    //   if (dayName == 'Friday' || dayName == 'Sunday' || dayName == 'Saturday'){
    if (dayName == 'Sunday' || dayName == 'Saturday') {
    //	if (dayName == 'Sunday'){
    //		var lookupdate = today;
    //	}else{
    //   	var lookupdate = yesterday;
    //		}
    
        request(luxuryurl, function(error, response, body) {
            if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );

                console.log("Error: " + error);
            }else{

            if (response.statusCode === 200) {
                var $ = cheerio.load(body);
            }

           // $('h2[id="' + newdate + '"]')
//             $('h3').text(lookupdate)
           //     .next('h3')
           //     .each(function() {
           //         var $el = $(this);
           //         var datex = $(this).text()
                   luxurytext += "This weekend, the Luxury Vendor sells: \n";
           //     })
       //          .next('ul')
//                 .find('li')
//                 .each(function() {
//                     var $el = $(this);
//                     luxurytext +=" * " + $(this).text() + "\n";
//                 });
            //   console.log(lookupdates);
             
                for (var i = 0, len = lookupdates.length; i < len; i++) {
        			results = $('h3').filter(function() {
  						return $(this).text().trim() === lookupdates[i] ;
					}).next('ul')
             	   .find('li')
             	   .each(function() {
             	       var $el = $(this);
             	       luxurytext +=" * " + $(this).text() + "\n";
               		});
				}


         msg.channel.sendMessage(luxurytext);
       }
       });
		
    } else {
        msg.channel.sendMessage("It's not weekend, nothing to sell. Sorry!");
    } // end else

};