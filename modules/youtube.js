const async = require('async');
const request = require("request");
const Promise = require('bluebird');

const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    return lastWeek;
}

function httpGet(url) {
    return new Promise((resolve) => {
        const options = {
            url: url,
            json: true
        };
        request(options,
            function(err, res, body) {
                // console.log(body)
                resolve(body);

            }
        );
    })
}

function getDbRecords(mysql, all, callback) {
    var query = "";
    if (all){
    	query ='SELECT * FROM youtube ORDER BY date DESC, RAND() LIMIT 30;;';
    }else{
    	query ='SELECT * FROM youtube ORDER BY date DESC, RAND() LIMIT 5;';    
    }
    
    
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(results)
    })
}

function setDbRecords(mysql, query, callback) {
    dh.mysqlQuery(mysql, query, function(error, results) {
        callback(results)
    })
}

var yturl = "https://www.googleapis.com/youtube/v3/"

module.exports = (bot, msg, key, options, mysql, Discord) => {
    var embed = mh.prepare(Discord)

    if (options.options[0] == "-help") {
        embed.setTitle("Options for " + options.command)

        embed.addField(options.command, "Shows hot, recent and recommended videos")
        embed.addField(options.command + " eso magicka dk morrowind", "Shows top results for this query")
        embed.addField(options.command + " -recommend ERcZznUKCdw", "Recommend a video to other Fox-Bot users using the offical youtube video id")
        embed.addField(options.command + " -more", "See only recommended videos, but 30 of those.")

        mh.send(msg, embed, options);

    } else if (options.options[0] == "-recommend") {
        var querypart = []
        var promises = [];

        for (var i = 0; i < options.others.length; i++) {
            var url = yturl + "videos?part=snippet&id=" + options.others[i] + "&key=" + key
            //console.log(url)
            promises.push(httpGet(url))
        }

        Promise.all(promises).then(body => {

            for (var j = 0; j < body.length; j++) {
                //console.log(body[j].items)
                if (body[j].items.length > 0) {
                    var youtuber = JSON.stringify(body[j].items[0].snippet.channelTitle).replace(/\"/g, "")
                    var yttitle = JSON.stringify(body[j].items[0].snippet.title).replace(/\"/g, "")
                    var id = JSON.stringify(body[j].items[0].id).replace(/\"/g, "")

                    embed.addField(youtuber, yttitle)
                    querypart.push('(CURDATE(),"' + msg.author.id + '","' + youtuber + '","' + yttitle + '","' + id + '")')
                }

            }

        }).then(function() {
            var query = 'INSERT INTO youtube (date,recommender,youtuber, title, id) VALUES ' + querypart.join(",") + ' ON DUPLICATE KEY UPDATE date = CURDATE();\n';

            setDbRecords(mysql, query, function() {
                embed.setTitle("Thank you for your suggestion!")
                embed.setDescription("The following videos have been added to the recommendation list")
                mh.send(msg, embed, options)
            })
        });

    } else if (options.options[0] == "-more") {

                getDbRecords(mysql, true, function(results) {

                    if (results.length > 0) {
                        var curcount = 1;
                        var youtubeout = "";
                        for (var z = 0; z < results.length; z++) {
                            youtubeout += "\n" + curcount + ". **[" + results[z].youtuber + '](http://youtube.com/watch?v=' + results[z].id + ')**: ' + results[z].title;
                            curcount++;
                        }
                        embed.addField("More videos recommended recently: ", youtubeout)
                    }
                    mh.send(msg, embed, options)
                })


    } else {

        if (options.options.length == 0 & options.others.length == 0) {


            var lastweek = getLastWeek();

            var cats = {
                "hot": {
                    "url": "&order=viewCount&publishedAfter=" + lastweek.toISOString(),
                    "title": "Hot recent ESO videos on YouTube are:",
                    "count": 5
                },
                "new": {
                    "url": "&order=date&publishedAfter=" + lastweek.toISOString(),
                    "title": "Newest ESO videos on YouTube are:",
                    "count": 3
                }
            }

            var baseurl = yturl + "search?q=Elder+Scrolls+Online&lr=en&part=snippet&maxResults=20&type=video&key=" + key

            var out;


            var promises = [];

            for (var i = 0; i < Object.keys(cats).length; i++) {
                var thiscat = Object.keys(cats)[i]
                var url = baseurl + cats[thiscat].url


                //console.log(body);
                promises.push(httpGet(url))

            }

            Promise.all(promises).then(body => {

                for (var j = 0; j < body.length; j++) {
                    var thistube = cats[Object.keys(cats)[j]]

                    var curcount = 1;
                    var youtubeout = "";

                    for (var i = 0; curcount <= thistube.count; i++) {

                        if (body[j].items[i]) {
                            youtubeout += "\n" + curcount + ". **[" + JSON.stringify(body[j].items[i].snippet.channelTitle).replace(/\"/g, "") + '](http://youtube.com/watch?v=' + JSON.stringify(body[j].items[i].id.videoId).replace(/\"/g, "") + ')**: ' + JSON.stringify(body[j].items[i].snippet.title).replace(/\"/g, "");
                            curcount++;
                        }
                    }
                    embed.addField(thistube.title, youtubeout)
                }

            }).then(function() {
                getDbRecords(mysql, false, function(results) {

                    if (results.length > 0) {
                        var curcount = 1;
                        var youtubeout = "";
                        for (var z = 0; z < results.length; z++) {
                            youtubeout += "\n" + curcount + ". **[" + results[z].youtuber + '](http://youtube.com/watch?v=' + results[z].id + ')**: ' + results[z].title;
                            curcount++;
                        }
                        embed.addField("Some recently recommended by other Fox-Bot users: (**!youtube -more** for more)", youtubeout)
                    }
                    mh.send(msg, embed, options)
                })

            })

        } else {
        	//console.log(options.others)

            var url = encodeURI(yturl + "search?q=" + options.others.join(" ") + "&part=snippet&maxResults=5&type=video&order=viewCount&key=" + key)
            //console.log(url)

            var promises = [];
            promises.push(httpGet(url))

            Promise.all(promises).then(body => {
           // 	console.log(promises)

                for (var j = 0; j < body.length; j++) {

                    var curcount = 1;
                    var youtubeout = "";

                    for (var i = 0; curcount <= 5; i++) {

                        if (body[j].items[i]) {
                            youtubeout += "\n" + curcount + ". **[" + JSON.stringify(body[j].items[i].snippet.channelTitle).replace(/\"/g, "") + '](http://youtube.com/watch?v=' + JSON.stringify(body[j].items[i].id.videoId).replace(/\"/g, "") + ')**: ' + JSON.stringify(body[j].items[i].snippet.title).replace(/\"/g, "");
                            curcount++;
                        }
                    }
                    embed.addField("Results for '" + options.others.join(" ") + "'", youtubeout)
                }

            }).then(function() {
               mh.send(msg, embed, options)
            })




        }
    }

};