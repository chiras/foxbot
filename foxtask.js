const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const util = require('util')
const traverse = require('traverse');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const https = require('https');
const Discord = require("discord.js");
const WebHooks = require('node-webhooks')
const request = require('request')
const cheerio = require('cheerio')
const Promise = require('bluebird');
const extract = require('extract-zip')
const fileExists = require('file-exists');

const eh = require("./helper/events.js")

var webHooks = new WebHooks({
    db: './tokens/webHooksDB.json', // json file that store webhook URLs 
})

var debugtime = new Date(Date.now() + 60);

function getLogDate() {
    var currentdate = moment().tz("Europe/Berlin").format() + " -> ";
    return currentdate
}

//////////////////////////////////////////////////////////////////////////////////////////
/// GOLDEN UPDATE
function getDbMaxId(db, vendor, callback) {
    db.all("SELECT MAX(dateid) FROM " + vendor, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
};

function insertVendorDB(db, items, searchdate, vendor, callback) {

    getDbMaxId(db, vendor, function(err, max) {
        var day = Number(max[0]['MAX(dateid)']) + 1;
        db.serialize(() => {
            var stmt = db.prepare('INSERT into ' + vendor + ' values (?,?,?)');
            for (var i = 0; i < items.length; i++) {
                stmt.run([day, searchdate, items[i]]);
            }

            stmt.finalize();
        }) // end serialize
    })
};

var excludeUpdates = ["soon", "TBD", "soon(TM)", "soon (TM)"]

var findOne = function(haystack, arr) {
    return arr.some(function(v) {
        return haystack.indexOf(v) >= 0;
    });
};

function vendorUpdate(url, searchdate, db, vendor) {
    return new Promise((resolve) => {
        var promiseVendor = new Promise((resolve, reject) => {
            request(url, function(error, response, body) {
                var items = []
                if (error) {
                    console.log("Error: " + error);
                } else {
                    // check wether we got a website (redundant to previous check?)
                    if (response.statusCode === 200) {
                        var $ = cheerio.load(body);
                    }

                    //scrape the site for the day

                    var hits = $('h3').filter(function() {
                        return $(this).text().trim() === searchdate;
                    }).length

                    if (hits) {
                        results = $('h3').filter(function() {
                                return $(this).text().trim() === searchdate;
                            }).next('ul').find('li')
                            .each(function() {
                                var $el = $(this);
                                items.push($(this).text().trim())
                            }).parent(function() {
                                resolve(items)
                            }); // end each		                    	
                    } else {
                        resolve(items)
                    }


                } // end check for successful request
            });
        });
        promiseVendor.then(items => {
            if (items.length > 0 && findOne(items, excludeUpdates) == 0) {
                console.log(getLogDate() + "SUCCESS vendor update: " + vendor);
                console.log(items); // Success!
                insertVendorDB(db, items, searchdate, vendor)
                webHooks.trigger('weekendvendors', {
                    "username": vendors[vendor].username,
                    "content": "New " + vendors[vendor].name + " wares available: \n* " + items.join("\n* ")
                })
                return 0;
            } else {
                console.log(getLogDate() + "FAILED vendor update: " + vendor);
                return 1;
            }

        }, reason => {
            console.log(reason); // Error!
            return 1;
        }).then(failure => {
            resolve(failure)
        })
    })
}

var vendors = JSON.parse(fs.readFileSync('data/json/vendors.json', 'utf8'));
var vendordb = new sqlite3.Database('./data/dbs/vendors.db');

var scheduleVendor = schedule.scheduleJob('1 1 59 * * 6', function() { // vendor comes online, try to refresh stores
    //var schedGolden = schedule.scheduleJob(debugtime, function(){		// for debugging only
    webHooks.trigger('service', {
        "content": "Update Vendors: started"
    })

    // current date
    var searchdate = moment().tz("America/New_York").format("YYYY-MM-DD");
    //var searchdate = "2017-05-19" // for debugging only

    console.log(getLogDate() + "Weekend Vendors came online, refreshing: " + searchdate);

    let startTime = new Date(Date.now() + 10);
    let endTime = new Date(startTime.getTime() + 60000 * 60); // do the searching for 60 minutes after start	
    // console.log (startTime + "-->"+ endTime)

    for (var i = 0; i < Object.keys(vendors).length; i++) {
        vendors[Object.keys(vendors)[i]].updating = 1
    }

    var k = schedule.scheduleJob({
        start: startTime,
        end: endTime,
        rule: '30 * * * * *'
    }, function() { // refresh every minute		
        var promises = [];

        for (var i = 0; i < Object.keys(vendors).length; i++) {
            var vendor = Object.keys(vendors)[i]
            if (vendors[vendor].updating) {
                promises.push(vendorUpdate(vendors[vendor].url, searchdate, vendordb, vendor))
            } else {
                promises.push(0)
            }
        }

        Promise.all(promises).then(values => {
            var notfinished = 0;

            for (var i = 0; i < Object.keys(vendors).length; i++) {
                var vendor = Object.keys(vendors)[i];
                vendors[vendor].updating = [...values][i]
                notfinished = notfinished + values[i];
            }

            if (notfinished == 0) {
                console.log(getLogDate() + "all vendors updated!");
                webHooks.trigger('service', {
                    "content": "Update Vendors: finished"
                })

                k.cancel()
            }
        })

    });
});

//////////////////////////////////////////////////////////////////////////////////////////
/// PLEDGES UPDATE

// scheduled to do everyday on 8:01 am
var schedulePledges = schedule.scheduleJob('30 0 8 * * *', function() {
    console.log(getLogDate() + "Pledges Update")
    eh.pledges(function(pledgesTxt, pledgesTxtNext) {
        webHooks.trigger('quartermaster', {
            "username": "The Undaunted Quartermaster",
            "title": "Pledges update",
            "content": "Today's new pledges are: \n" + pledgesTxt
        })
    })

});

//////////////////////////////////////////////////////////////////////////////////////////
/// REALM STATUS UPDATE
function getXml(uri, callback) {
    https.get({
        host: uri[0],
        path: uri[1]
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            callback(body);
        });
    });
}

const realmStatus = ['live-services.elderscrollsonline.com', '/status/realms'];
const launcherMessage = ['live-services.elderscrollsonline.com', '/announcement/message?announcer_id=2'];

var realms = {
    "EU": "",
    "NA": "",
    "PTS": "",
    "PS4 - EU": "",
    "PS4 - US": "",
    "XBox - US": "",
    "XBox - EU": ""
}

var launcher = "";
var botStartup = 1;

// scheduled to do every 5 mins
var scheduleRealm = schedule.scheduleJob('*/5 * * * *', function() {

    getXml(realmStatus, function(data) {
        let dirty = false;
        var changedTxt = "";
        data = JSON.parse(data);
        let r = data['zos_platform_response'];
        if (!r)
            return;

        r = r['response'];
        if (!r)
            return;

        //console.log(r)
        for (i = 0; i < Object.keys(realms).length; i++) {
            let x = r['The Elder Scrolls Online (' + Object.keys(realms)[i] + ')'];

            if (realms[Object.keys(realms)[i]] != x) {
                //console.log(Object.keys(realms)[i]+ ' server status is now ' + x); 
                changedTxt += Object.keys(realms)[i] + ' server status is now ' + x + "\n";
                dirty = true;
                realms[Object.keys(realms)[i]] = x;
            }
        }

        if (changedTxt && !botStartup) {
            console.log(getLogDate() + "Realm update: changed")
            webHooks.trigger('realm', {
                "username": "The Watcher",
                "title": "Status update",
                "content": changedTxt
            })
        } else {
            //			console.log(getLogDate() + "Realm update: not changed")		
        }

        getXml(launcherMessage, function(data) {
            data = JSON.parse(data);
            let r = data['zos_platform_response'];
            if (!r)
                return;

            r = r['response'];
            if (!r)
                return;

            let message = '';

            for (let i = 0; r && i < r.length; ++i) {
                if (r[i] && r[i]['message'] && r[i]['message'].length > 0)
                    message += r[i]['message'] + '\n';
            }

            if (message != "" && launcher != message && !botStartup) {

                console.log(getLogDate() + 'New Launcher Message:\n' + message);
                webHooks.trigger('realm', {
                    "username": "The Watcher",
                    "title": "Launcher Message",
                    "content": message
                })

                dirty = true;
            }
            launcher = message;
        });
        botStartup = 0;

    });


});


//////////////////////////////////////////////////////////////////////////////////////////
/// TTC UPDATE

function ttcCreateItemTable(json, callback) {

    db.serialize(() => {
        db.run('drop table items'); //or drop the table first..
        db.run('create table if not exists ' +
            'items (' +
            'id numeric primary key, ' +
            'name text)');

        var stmt = db.prepare('insert into items values (?,?)');

        var doneItems = []

        for (var i = 0; i < json.length; i++) {
            var counter = 0;
            for (var key in json[i].items) {
                if (doneItems.includes(key) == false) {
                    stmt.run([json[i].items[key], key]);
                    doneItems.push(key)
                    counter++;
                }
            }
            console.log(getLogDate() + "TTC Item table inserts: " + json[i].megaserver + " --> " + counter + " added")
        }

        stmt.finalize(function(result) {
            callback(getLogDate() + "TTC Item tables have been updated")
        });

    });
}

function ttcCreateInfoTable(json, callback) {
    db.serialize(() => {
        db.run('drop table info'); //or drop the table first..
        db.run('create table if not exists ' +
            'info (' +
            'megaserver text, ' +
            'timestamp text)');

        var stmt2 = db.prepare('insert into info values (?,?)');

        for (var i = 0; i < json.length; i++) {
            stmt2.run([json[i].megaserver, json[i].date]);
        }

        stmt2.finalize(function(resultDate) {
            callback(getLogDate() + "TTC Info table has been updated")
        });

    })
}

function ttcCreatePriceTable(jsonAll, callback) {

    db.serialize(() => {
        db.run('drop table prices'); //or drop the table first..
        db.run('create table if not exists ' +
            'prices (' +
            'id numeric, ' +
            'megaserver text, ' +
            'quality numeric, ' +
            'level numeric, ' +
            'trait numeric, ' +
            'category text, ' +
            'vouchers numeric, ' +
            'countEntry numeric, ' +
            'countAmount numeric, ' +
            'suggested numeric, ' +
            'avg numeric, ' +
            'max numeric, ' +
            'min numeric)');

        var stmt = db.prepare('insert into prices values (?,?,?,?,?,?,?,?,?,?,?,?,?)');

        for (var i = 0; i < jsonAll.length; i++) {
            var json = jsonAll[i].price
            var megaserver = jsonAll[i].megaserver
            console.log(getLogDate() + "TTC Preparing price table inserts: " + megaserver)

            var voucher = [];
            traverse(json).forEach(function(x) {
                if (this.node["Min"]) {
                    var suggested = null;
                    if (this.node["SuggestedPrice"]) {
                        suggested = this.node["SuggestedPrice"]
                    }

                    if (this.level == 4) {
                        stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], null, null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
                    } else if (this.level == 5) {
                        stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], this.path[4], null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
                    } else if (this.level == 8) {
                        if (!voucher.includes(this.path[1])) {

                            voucher.push(this.path[1])

                        }
                        stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], null, this.path[6], this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);

                        // these are the writs
                    }
                }
            });
        };

        stmt.finalize(function(result) {
            callback(getLogDate() + "TTC Price tables have been updated: ")
        });
    });
}

const db = new sqlite3.Database('./data/dbs/ttc.db');

var timestamp = "";

var ttcdownload = {
    "us": "https://us.tamrieltradecentre.com/Download/PriceTable",
    "eu": "https://eu.tamrieltradecentre.com/Download/PriceTable"
}

var asyncExtract = Promise.promisify(require("extract-zip"));

function ttcUpdate(megaserver) {
    return new Promise((resolve) => {

        var path = process.cwd() + "/data/tmp/" + "ttc_" + moment().tz("Europe/Berlin").format("YYYY-MM-DD") + "_" + megaserver
        var zipfile = path + ".zip"


        var promiseDownload = new Promise((resolve, reject) => {
            fileExists(zipfile, function(err, exists) {

                //console.log(exists + zipfile)
                if (exists) {
                    console.log(getLogDate() + "TTC File exists: " + megaserver)
                    resolve();
                } else {
                    var stream = fs.createWriteStream(zipfile);
                    console.log(getLogDate() + "TTC Starting download: " + megaserver)
                    var requestTTC = https.get(ttcdownload[megaserver], function(response) {
                        response.pipe(stream);
                        response.on("end", function() { //waits for data to be consumed
                            // pipe has ended here, so we resolve the promise
                            console.log(getLogDate() + "TTC download complete: " + megaserver)
                            resolve();
                        });
                    });
                }

            }) // OUTPUTS: true or false 

        }).then(function() {
            console.log(getLogDate() + "TTC decompression of zip: " + megaserver)
            asyncExtract(zipfile, {
                dir: path
            }, function(err) {
                //console.log(err)
                return
                // extraction is complete. make sure to handle the err 
            })
        }).then(function() {
            console.log(getLogDate() + "TTC Preparing Item table: " + megaserver)
            var itemtable = path + "/ItemLookUpTable_EN.lua"
            var contents = fs.readFileSync(itemtable, 'utf8');
            contents = contents.replace(/\["/g, '"').replace(/"\]/g, '"').replace(/\[/g, '"').replace(/\]/g, '"').replace(/,}/g, '}').replace(/=/g, ':');
            contents = contents.substring(contents.indexOf('{'), contents.lastIndexOf('}') + 1);

            var item = JSON.parse(contents);

            return item
        }).then(function(jsonitem) {
            var pricetable = path + "/PriceTable.lua"
            var contents_price = fs.readFileSync(pricetable, 'utf8');
            contents_price = contents_price.replace(/\["/g, '"').replace(/"\]/g, '"').replace(/\[/g, '"').replace(/\]/g, '"').replace(/,}/g, '}').replace(/=/g, ':');
            contents_price = contents_price.substring(contents_price.indexOf('{'), contents_price.lastIndexOf('}') + 1);

            console.log(getLogDate() + "TTC Preparing Price table: " + megaserver)

            var json = JSON.parse(contents_price);

            resolve({
                megaserver: megaserver,
                items: jsonitem,
                price: json.Data,
                date: json.TimeStamp
            })
        })
    }) // end return promis
}

var scheduleTTC = schedule.scheduleJob('0 0 6 * * 3', function(){
//var scheduleTTC = schedule.scheduleJob(debugtime, function() {
    webHooks.trigger('service', {
        "content": "Update TTC: started"
    })
    var promises = [];
    for (var i = 0; i < Object.keys(ttcdownload).length; i++) {
        promises.push(ttcUpdate(Object.keys(ttcdownload)[i]))
    }

    Promise.all(promises).then(alldata => {
        db.serialize(() => {

            ttcCreateItemTable(alldata, function(resultItem) {
                console.log(resultItem);
                ttcCreateInfoTable(alldata, function(resultPrice) {
                    console.log(resultPrice)
                    ttcCreatePriceTable(alldata, function(resultInfo) {
                        console.log(resultInfo)
                        webHooks.trigger('service', {
                            "content": "Update TTC: finished"
                        })
                    });
                });
            });
        }) // end serialize
    })
}) //schedule

//////////////////////////////////////////////////////////////////////////////////////////
/// ITEMS UPDATE
// http://esolog.uesp.net/itemLink.php?itemid=70
// http://esoitem.uesp.net/item-70-66-5.png
// http://esoitem.uesp.net/viewlog.php?record=setSummary&format=csv
const esoitemUrl = "https://esolog.uesp.net/exportJson.php?table=setSummary"
const esoskillUrl = "https://esolog.uesp.net/exportJson.php?table=playerSkills"
// https://esolog.uesp.net/exportJson.php?table=cpSkills
// http://esolog.uesp.net/exportJson.php?table=minedItemSummary


/// DOC: http://en.uesp.net/wiki/User:Daveh/ESO_Log_Collector#ItemLinkImage_Documentation

const itemdb = new sqlite3.Database('./data/dbs/item.db');
const skilldb = new sqlite3.Database('./data/dbs/skill.db');

function createEsoItemTable(db, json, callback) {

    db.serialize(() => {
        db.run('drop table if exists sets '); //or drop the table first..
        db.run('create table if not exists ' +
            'sets (' +
            'id numeric primary key, ' +
            'setName text, ' +
            'setMaxEquipCount text, ' +
            'setBonusCount text, ' +
            'itemCount text, ' +
            'setBonusDesc1 text, ' +
            'setBonusDesc2 text, ' +
            'setBonusDesc3 text, ' +
            'setBonusDesc4 text, ' +
            'setBonusDesc5 text, ' +
            'setBonusDesc text, ' +
            'itemSlots text)');

        var stmt = db.prepare('insert into sets values (?,?,?,?,?,?,?,?,?,?,?,?)');

        for (var i = 0; i < json.setSummary.length; i++) {
            stmt.run([	json.setSummary[i]["id"], 
            			json.setSummary[i]["setName"],
            			json.setSummary[i]["setMaxEquipCount"],
            			json.setSummary[i]["setBonusCount"],
            			json.setSummary[i]["itemCount"],
            			json.setSummary[i]["setBonusDesc1"],
            			json.setSummary[i]["setBonusDesc2"],
	            		json.setSummary[i]["setBonusDesc3"],	
            			json.setSummary[i]["setBonusDesc4"],
    	        		json.setSummary[i]["setBonusDesc5"],
        	    		json.setSummary[i]["setBonusDesc"],
            			json.setSummary[i]["itemSlots"]            
            			]);

        }

        console.log(getLogDate() + "EsoItem Set table inserts: " + json.setSummary.length + " added")

        stmt.finalize(function(result) {
            callback(getLogDate() + "EsoItem Set tables have been updated")
        });

    });
}

function createEsoSkillTable(db, json, callback) {

    db.serialize(() => {
        db.run('drop table if exists skills '); //or drop the table first..
        db.run('create table if not exists ' +
            'skills (' +
            'id numeric primary key, ' +
            'name text,' +
            'description text,' +
            'target text,' +
            'skillType text,' +
            'upgradeLines text,' +
            'effectLines text,' +
            'duration text,' +
            'cost text,' +
            'minRange text,' +
            'maxRange text,' +
            'radius text,' +
            'isPassive text,' +
            'isChanneled text,' +
            'castTime text,' +
            'channelTime text,' +
            'angleDistance text,' +
            'mechanic text,' +
            'texture text,' +
            'isPlayer text,' +
            'raceType text,' +
            'classType text,' +
            'skillLine text,' +
            'prevSkill text,' +
            'nextSkill text,' +
            'nextSkill2 text,' +
            'baseAbilityId text,' +
            'learnedLevel text,' +
            'rank text,' +
            'skillIndex text,' +
            'numCoefVars text,' +
            'coefDescription text,' +
            'type1 text,' +
            'a1 text,' +
            'b1 text,' +
            'c1 text,' +
            'R1 text,' +
            'avg1 text,' +
            'type2 text,' +
            'a2 text,' +
            'b2 text,' +
            'c2 text,' +
            'R2 text,' +
            'avg2 text,' +
            'type3 text,' +
            'a3 text,' +
            'b3 text,' +
            'c3 text,' +
            'R3 text,' +
            'avg3 text,' +
            'type4 text,' +
            'a4 text,' +
            'b4 text,' +
            'c4 text,' +
            'R4 text,' +
            'avg4 text,' +
            'type5 text,' +
            'a5 text,' +
            'b5 text,' +
            'c5 text,' +
            'R5 text,' +
            'avg5 text,' +
            'type6 text,' +
            'a6 text,' +
            'b6 text,' +
            'c6 text,' +
            'R6 text,' +
            'avg6 text)');

        var stmt = db.prepare('insert into skills values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    console.log(json.playerSkills.length)

        for (var i = 0; i < json.playerSkills.length; i++) {
            stmt.run([	json.playerSkills[i]["id"],
            			json.playerSkills[i]["name"],
            			json.playerSkills[i]["description"],
            			json.playerSkills[i]["target"],
            			json.playerSkills[i]["skillType"],
            			json.playerSkills[i]["upgradeLines"],
            			json.playerSkills[i]["effectLines"],
            			json.playerSkills[i]["duration"],
            			json.playerSkills[i]["cost"],
            			json.playerSkills[i]["minRange"],
            			json.playerSkills[i]["maxRange"],
            			json.playerSkills[i]["radius"],
            			json.playerSkills[i]["isPassive"],
            			json.playerSkills[i]["isChanneled"],
            			json.playerSkills[i]["castTime"],
            			json.playerSkills[i]["channelTime"],
            			json.playerSkills[i]["angleDistance"],
            			json.playerSkills[i]["mechanic"],
            			json.playerSkills[i]["texture"],
            			json.playerSkills[i]["isPlayer"],
            			json.playerSkills[i]["raceType"],
            			json.playerSkills[i]["classType"],
            			json.playerSkills[i]["skillLine"],
            			json.playerSkills[i]["prevSkill"],
            			json.playerSkills[i]["nextSkill"],
            			json.playerSkills[i]["nextSkill2"],
            			json.playerSkills[i]["baseAbilityId"],
            			json.playerSkills[i]["learnedLevel"],
            			json.playerSkills[i]["rank"],
            			json.playerSkills[i]["skillIndex"],
            			json.playerSkills[i]["numCoefVars"],
            			json.playerSkills[i]["coefDescription"],
            			json.playerSkills[i]["type1"],
            			json.playerSkills[i]["a1"],
            			json.playerSkills[i]["b1"],
            			json.playerSkills[i]["c1"],
            			json.playerSkills[i]["R1"],
            			json.playerSkills[i]["avg1"],
            			json.playerSkills[i]["type2"],
            			json.playerSkills[i]["a2"],
            			json.playerSkills[i]["b2"],
            			json.playerSkills[i]["c2"],
            			json.playerSkills[i]["R2"],
            			json.playerSkills[i]["avg2"],
            			json.playerSkills[i]["type3"],
            			json.playerSkills[i]["a3"],
            			json.playerSkills[i]["b3"],
            			json.playerSkills[i]["c3"],
            			json.playerSkills[i]["R3"],
            			json.playerSkills[i]["avg3"],
            			json.playerSkills[i]["type4"],
            			json.playerSkills[i]["a4"],
            			json.playerSkills[i]["b4"],
            			json.playerSkills[i]["c4"],
            			json.playerSkills[i]["R4"],
            			json.playerSkills[i]["avg4"],
            			json.playerSkills[i]["type5"],
            			json.playerSkills[i]["a5"],
            			json.playerSkills[i]["b5"],
            			json.playerSkills[i]["c5"],
            			json.playerSkills[i]["R5"],
            			json.playerSkills[i]["avg5"],
            			json.playerSkills[i]["type6"],
            			json.playerSkills[i]["a6"],
            			json.playerSkills[i]["b6"],
            			json.playerSkills[i]["c6"],
            			json.playerSkills[i]["R6"],
            			json.playerSkills[i]["avg6"]         
            			]);

        }

        console.log(getLogDate() + "EsoItem Skill table inserts: " + json.playerSkills.length + " added")

        stmt.finalize(function(result) {
            callback(getLogDate() + "EsoItem Skill tables have been updated")
        });

    });
}

var scheduleEsoItem = schedule.scheduleJob('0 0 5 * * 3', function(){
//var scheduleEsoItem = schedule.scheduleJob(debugtime, function() {
	 webHooks.trigger('service', {
                            "content": "Update ESO skills/sets: started"
                    })
    console.log(getLogDate() + "EsoItem Starting Set download " )
    https.get(esoitemUrl, function(res) {
        var body = '';

    	res.on('data', function(chunk){
        	body += chunk;
    	});

    	res.on('end', function(){
        	var fbResponse = JSON.parse(body);
        	createEsoItemTable(itemdb, fbResponse, function(result){
        		console.log(result)
        	})
    	});
	}).on('error', function(e){
      	console.log("Got an error: ", e);
	});

    console.log(getLogDate() + "EsoSkill Starting Skill download " )
    https.get(esoskillUrl, function(res) {
        var body = '';

    	res.on('data', function(chunk){
        	body += chunk;
    	});

    	res.on('end', function(){
        	var sbResponse = JSON.parse(body);    	
            	createEsoSkillTable(skilldb, sbResponse, function(result){
        		console.log(result)
                        webHooks.trigger('service', {
                            "content": "Update ESO skills/sets: finished"
                        })
        	})
    	});
	}).on('error', function(e){
      	console.log("Got an error: ", e);
	});



})





