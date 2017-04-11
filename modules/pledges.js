module.exports = (bot, msg, request, cheerio) => {

    var pledgeurl = "https://esoleaderboards.com/api/getpledges.php"
    var pledgetimeurl = "https://esoleaderboards.com"
	
    request({
        url: pledgeurl,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            msg.channel.sendMessage("Pledges today are: " + JSON.stringify(body[1]) + ", " + JSON.stringify(body[2]) + " and " + JSON.stringify(body[3]) + "!");
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
                    msg.channel.sendMessage($(this).text());
                }
            });
        }

    });
    
};