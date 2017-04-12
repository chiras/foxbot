module.exports = (bot, msg, request, cheerio, util) => {

    var trialurl = "https://esoleaderboards.com"
    var weeklytrials = [];

    var baseurl = "http://en.uesp.net"
    var trials = {
        "Aetherian Archive": "/wiki/Online:Aetherian_Archive",
        "Hel Ra Citadel": "/wiki/Online:Hel_Ra_Citadel",
        "Sanctum Ophidia": "/wiki/Online:Sanctum_Ophidia",
        "Maw of Lorkhaj": "/wiki/Online:Maw_of_Lorkhaj",
    };


    request(trialurl, function(error, response, body) {
        if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
            console.log("Error: " + error);
        } else {

            if (response.statusCode === 200) {
                var $ = cheerio.load(body);
            }

            $('tr[class="header"]').find('th > p ').filter(function() {
                return $(this).text().trim() === "Weekly Trials";
            }).parentsUntil('tr[class="header"]').next().next().children('td').children('strong').each(function() {
                weeklytrials.push($(this).text().trim());

            });


            var trialText = "This week's special trials are [" + weeklytrials[0] + "](" + baseurl + trials[weeklytrials[0]] + ") (EU) and [" + weeklytrials[1] + "](" + baseurl + trials[weeklytrials[1]] + ") (US)";
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