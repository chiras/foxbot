// TO DO: use embed objects for messaging
// TO DO: cache the data and not make an API request every time it's called
// TO DO: history of golden objects 
// TO DO: reply also during the day of "old" vendor items
// TO DO: beautify return text

// Functions:
// need to get dates with zeros padded on days/months <10
// also in golden.js maybe outsource in both?
function pad(n) {
    return n < 10 ? '0' + n : n
}

// Data:
// URL of the golden history
var luxuryurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-luxury-furnisher-vendor-items/";

// start return of the module
module.exports = (bot, msg, gsDayNames, request, cheerio) => {

    // set up the return message content
    var luxurytext = "";

    // set up the date (see golden.js for details)
    var today = new Date();
    var yesterday = new Date();
    var preyesterday = new Date();
    var dayName = gsDayNames[today.getDay()];

    preyesterday.setDate(today.getDate() - 2);
    yesterday.setDate(today.getDate() - 1);

    var lookupdates = [preyesterday.getFullYear() + "-" + pad((preyesterday.getMonth() + 1)) + "-" + pad(preyesterday.getDate()),
        yesterday.getFullYear() + "-" + pad((yesterday.getMonth() + 1)) + "-" + pad(yesterday.getDate()),
        today.getFullYear() + "-" + pad((today.getMonth() + 1)) + "-" + pad(today.getDate())
    ];

	// check for weekend
    if (dayName == 'Sunday' || dayName == 'Saturday') {
		// weekend
		
        request(luxuryurl, function(error, response, body) {
            if (error) {
            	// on connection error
                msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
                console.log("Error: " + error);
            } else {
				// check wether we got a website (redundant to previous check?)		
                if (response.statusCode === 200) {
                    var $ = cheerio.load(body);
                }

				// set up message content (do we need to one above?)
                luxurytext += "This weekend, the Luxury Vendor sells: \n";

				// check all relevant dates for hits on the luxury site
                for (var i = 0, len = lookupdates.length; i < len; i++) {
                	//scrape content
                    results = $('h3').filter(function() {
                            return $(this).text().trim() === lookupdates[i];
                        }).next('ul')
                        .find('li')
                        .each(function() {
                            var $el = $(this);
                            // on hits get content and expand message
                            luxurytext += " * " + $(this).text() + "\n";
                        }); // end for each
                }	// end for days

				// send message
                msg.channel.sendEmbed({
                    color: 0x800000,
                    description: luxurytext,
                    footer: {
                        text: 'Data obtained from www.benevolentbowd.ca'
                    }
                }); // end message
            } // end if connection ok
        }); // end request

    } else {
		// not weekend
        msg.channel.sendEmbed({
            color: 0x800000,
            description: "It's not weekend, nothing to sell. Sorry!",
        }); // end message
    } // end else

};