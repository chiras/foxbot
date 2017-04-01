module.exports = (bot, msg, gsDayNames, request, cheerio) => {
	function pad(n){return n<10 ? '0'+n : n}

    var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";
//    var dateObj = new Date();
    var goldentext = "";

//     var time = dateObj.getTime(); //months from 1-12
//     var monthtmp = dateObj.getUTCMonth() + 1; //months from 1-12
//     var month;
//     if (monthtmp < 10) {
//         month = "0" + monthtmp;
//     } else {
//         month = monthtmp;
//     }

//     var day = dateObj.getUTCDate();
//     var year = dateObj.getUTCFullYear();
// 	
//     newdate = year + "" + month;
//     newdateday = day + "." + month + "." + year;
//     newdateday2 = year + "-" + month + "-" + day;

//     var d = new Date(newdateday2);
//     var dayName = gsDayNames[d.getDay()];

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
    
        request(goldenurl, function(error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }

            if (response.statusCode === 200) {
                var $ = cheerio.load(body);
            }

           // $('h2[id="' + newdate + '"]')
//             $('h3').text(lookupdate)
           //     .next('h3')
           //     .each(function() {
           //         var $el = $(this);
           //         var datex = $(this).text()
                   goldentext += "This weekend, the Golden Vendor sells: \n";
           //     })
       //          .next('ul')
//                 .find('li')
//                 .each(function() {
//                     var $el = $(this);
//                     goldentext +=" * " + $(this).text() + "\n";
//                 });
            //   console.log(lookupdates);
             
                for (var i = 0, len = lookupdates.length; i < len; i++) {
        			results = $('h3').filter(function() {
  						return $(this).text().trim() === lookupdates[i] ;
					}).next('ul')
             	   .find('li')
             	   .each(function() {
             	       var $el = $(this);
             	       goldentext +=" * " + $(this).text() + "\n";
               		});
				}


         msg.channel.sendMessage(goldentext);
       });

    } else {
        msg.channel.sendMessage("It's not weekend, nothing to sell. Sorry!");
    } // end else


};