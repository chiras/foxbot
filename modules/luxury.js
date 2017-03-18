module.exports = (bot, msg, gsDayNames, request, cheerio) => {

    var luxuryurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-luxury-furnisher-vendor-items/";
    var dateObj = new Date();
    var luxurytext = "";

    var time = dateObj.getTime(); //months from 1-12
    var monthtmp = dateObj.getUTCMonth() + 1; //months from 1-12
    var month;
    if (monthtmp < 10) {
        month = "0" + monthtmp;
    } else {
        month = monthtmp;
    }

    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
	
    newdate = year + "" + month;
    newdateday = day + "." + month + "." + year;
    newdateday2 = year + "-" + month + "-" + day;

    var d = new Date(newdateday2);
    var dayName = gsDayNames[d.getDay()];


    //   if (dayName == 'Friday' || dayName == 'Sunday' || dayName == 'Saturday'){
    if (dayName == 'Sunday' || dayName == 'Saturday') {
    
        request(luxuryurl, function(error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }

            if (response.statusCode === 200) {
                var $ = cheerio.load(body);
            }

            $('h2[id="' + newdate + '"]')
                .next('h3')
                .each(function() {
                    var $el = $(this);
                    var datex = $(this).text()
                    luxurytext += "This weekend (" + datex + "), the Luxury Vendor sells: \n";
                })
               // .next('pre')
                .next('ul')
                .find('li')
                .each(function() {
                    var $el = $(this);
                    luxurytext +=" * " + $(this).text() + "\n";
                });
         msg.channel.sendMessage(luxurytext);
       });

    } else {
        msg.channel.sendMessage("It's not weekend, nothing to sell. Sorry!");
    } // end else


};