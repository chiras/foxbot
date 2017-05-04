// TO DO: use embed objects for messaging
// TO DO: cache the data and not make an API request every time it's called
// TO DO: history of golden objects 
// TO DO: reply also during the day of "old" vendor items
// TO DO: beautify return text

// Functions:
// need to get dates with zeros padded on days/months <10
function pad(n) {
    return n < 10 ? '0' + n : n
}

// Data:
// URL of the golden history
var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";


// return of the module
module.exports = (bot, msg, gsDayNames, request, cheerio) => {

    // set up message content
    var goldentext = "";

    // determine the day, and yesterday (to check on sundays), and day before, because sometimes the history has still friday name
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


    if (dayName == 'Sunday' || dayName == 'Saturday') {
		// weekend:
		
        // do the web scraping, not nice, but works
        request(goldenurl, function(error, response, body) {
            if (error) {
                // on error
                msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
                console.log("Error: " + error);
            } else {
				
				// check wether we got a website (redundant to previous check?)
                if (response.statusCode === 200) {
                    var $ = cheerio.load(body);
                }

                // starting the return text (redundant to previous?)
                goldentext += "This weekend, the Golden Vendor sells: \n";

                // check today, yesterday and day before whether there is a hit
                for (var i = 0, len = lookupdates.length; i < len; i++) {
                	//scrape the site for the day
                    results = $('h3').filter(function() {
                            return $(this).text().trim() === lookupdates[i];
                        }).next('ul')
                        .find('li')
                        .each(function() {
                            var $el = $(this);
                            // extend the return message by all hits
                            goldentext += " * " + $(this).text() + "\n";
                        }); // end each
                } // end for dates

				// send the message
                msg.channel.sendEmbed({
                    color: 0x800000,
                    description: goldentext,
                    footer: {
                        text: 'Data obtained from www.benevolentbowd.ca'
                    }
                }); // end message
            } // end check for successful request
        }); // end request

    } else {
 	   // not weekend:
       msg.channel.sendEmbed({
            color: 0x800000,
            description: "It's not weekend, nothing to sell. Sorry!",
       }); // end message
    } // end else
};