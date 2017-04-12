module.exports = (bot, msg, twitch, util) => {

    twitch.searchStreams({
        query: "The+Elder+Scrolls+Online",
        limit: 10
    }, function(err, body) {
        if (err) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later.");
            console.log(err);
        } else {
            var twitchout = "";
            var maxcount = 5;
            var curcount = 1;

            for (var i = 0; curcount <= 5; i++) {
                if (body.streams[i]) {
                    twitchout += "\n" + curcount + ". **[" + JSON.stringify(body.streams[i].channel.display_name).replace(/\"/g, "") + "](http://twitch.tv/" + body.streams[i].channel.display_name + ")** " + "(" + JSON.stringify(body.streams[i].viewers) + ' Viewers): ' + JSON.stringify(body.streams[i].channel.status) + '\n';
                    curcount++;
                }
            }



            msg.channel.sendEmbed({
                color: 0x800000,
                fields: [{
                    name: 'Hot ESO streams online on Twitch.tv are:',
                    value: twitchout
                }]
            });

        }
    });

};