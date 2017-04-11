module.exports = (bot, msg, request, cheerio) => {
    var statusurl = "https://forums.elderscrollsonline.com/en";

    request(statusurl, function(error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }else{
        
        var $statusbin = 0;
        if (response.statusCode === 200) {
            var $ = cheerio.load(body);
        }
        $('div[class="DismissMessage AlertMessage"]')
            .each(function() {
                $statusbin = 1;
                var $el = $(this);
                msg.channel.sendMessage(" * " + $(this).text());

            });
        if ($statusbin == "0") {
            msg.channel.sendMessage("Currently no server announcements, everything should be running.");
            

        }}
    });

};