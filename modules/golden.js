module.exports = (bot, msg, gsDayNames, request, cheerio) => {

    var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";
    var dateObj = new Date();

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
        request(goldenurl, function(error, response, body) {
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
                    msg.channel.sendMessage("This weekend (" + datex + "), the Golden Vendor sells: ");
                })
                .next('ul')
                .find('li')
                .each(function() {
                    var $el = $(this);
                    msg.channel.sendMessage(" * " + $(this).text());
                });
        });

    } else {
        msg.channel.sendMessage("It's not weekend, nothing to sell. Sorry!");
    } // end else


};