module.exports = (bot, msg, request, youtube) => {
    const async = require('async');

    function getLastWeek() {
        var today = new Date();
        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
        return lastWeek;
    }

    function httpGet(url, callback) {
        const options = {
            url: url,
            json: true
        };
        request(options,
            function(err, res, body) {
                callback(err, body);
            }
        );
    }

    var lastweek = getLastWeek();
    var youtubeurlhot = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&order=viewCount&publishedAfter=" + lastweek.toISOString() + "&q=Elder+Scrolls+Online&lr=en&type=video&key=AIzaSyCgNeM4jBdyRKdE75loEpw-vPC_seN6L7A";
    var youtubeurlnew = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&order=date&publishedAfter=" + lastweek.toISOString() + "&q=Elder+Scrolls+Online&lr=en&type=video&key=AIzaSyCgNeM4jBdyRKdE75loEpw-vPC_seN6L7A";

    const urls = [
        youtubeurlhot,
        youtubeurlnew
    ];

    const headers = [
        "Hot recent ESO videos on YouTube are:",
        "Newest ESO videos on YouTube are:"
    ];


    var out;

    async.map(urls, httpGet, function(err, body) {
        if (err) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
            return console.log(err);
        } else {
            //console.log(body);

            var maxcount = 5;

            for (var j = 0; j <= 1; j++) {

                var curcount = 1;
                var youtubeout = "";

                for (var i = 0; curcount <= maxcount; i++) {

                    if (body[j].items[i]) {
                        youtubeout += "\n\n" + curcount + ". **[" + JSON.stringify(body[j].items[i].snippet.channelTitle).replace(/\"/g, "") + '](http://youtube.com/watch?v=' + JSON.stringify(body[j].items[i].id.videoId).replace(/\"/g, "") + ')**: ' + JSON.stringify(body[j].items[i].snippet.title).replace(/\"/g, "");
                        curcount++;
                    }
                }
                msg.channel.sendEmbed({
                    color: 0x800000,
                    description: " ",
                    fields: [{
                        name: headers[j],
                        value: youtubeout
                    }]
                });

            }


        }

    });

};