// better sales: http://esosales.uesp.net/pricesNA/uespSalesPrices.lua
// http://esosales.uesp.net/salesPrices.shtml
const tokens = require('./tokens/dev.json');

const luaparse = require('luaparse');
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
const sql = require('mysql');
const csv=require('csvtojson')

const eh = require("./helper/events.js")
const dh = require("./helper/db.js")

// mysql database
var mysql = sql.createPool({
  multipleStatements: true,
  host     : 'localhost',
  user     : tokens["mysqluser"],
  password : tokens["mysqlpass"],
  database : 'foxbot'
});

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
function getDbMaxId(mysql, vendor, callback) {
	var query = "SELECT MAX(dateid) FROM vendors WHERE type = '"+vendor+"';";
	
    dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
};

function insertVendorDB(mysql, items, searchdate, vendor, callback) {

    getDbMaxId(mysql, vendor, function(err, max) {
        var day = Number(max[0]['MAX(dateid)']) + 1;
            for (var i = 0; i < items.length; i++) {
            	var query = 'INSERT INTO vendors (dateid, date, item, type) VALUES ("'+day+'","'+searchdate+'","'+items[i]+'","'+vendor+'");';
    			dh.mysqlQuery(mysql, query, function(err, all) {
      				  if (err) {
      			      console.log(err)
			        };
    			    callback(err, all);
   				 });
            }
    })
};

var excludeUpdates = ["soon", "TBD", "soon(TM)", "soon (TM)", "Soon (TM)","Soon(tm)","soon(tm)"]

var findOne = function(haystack, arr) {
    return arr.some(function(v) {
        return haystack.indexOf(v) >= 0;
    });
};

function vendorUpdate(url, searchdate, mysql, vendor) {
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
                insertVendorDB(mysql, items, searchdate, vendor,function(err,all){
                })
                console.log(getLogDate() + "SUCCESS vendor update: " + vendor +" -> "+ items.join(", "));

                    webHooks.trigger('weekendvendors', {
                    "username": vendors[vendor].username,
                    "content": "New " + vendors[vendor].name + " wares available: \n* " + items.join("\n* ")
                	})            
                return 0;

            } else {
                console.log(getLogDate() + "FAILED vendor update: " + vendor +" -> "+ items.join(", "));
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

var scheduleVendor = schedule.scheduleJob('0 58 1 * * 6', function() { // vendor comes online, try to refresh stores
//    var scheduleVendor = schedule.scheduleJob(debugtime, function(){		// for debugging only
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
                promises.push(vendorUpdate(vendors[vendor].url, searchdate, mysql, vendor))
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
//var schedulePledges = schedule.scheduleJob(debugtime, function() {
		var time = moment().unix()

		eh.pledges(time, function(pledgesTxt, pledgesTxtNext){
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
				var query = "UPDATE `servers` SET time = NOW(), status = '" +x+ "' WHERE id = '"+Object.keys(realms)[i]+"'";
				dh.mysqlQuery(mysql, query, function(error, results) {
				})
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
                    message += r[i]['message'].replace(/\'/g, '"') + '\n';
            }
			
			var query = "UPDATE `servers` SET time = NOW(), status = '"+message+ "' WHERE id = '_launcher'";
            dh.mysqlQuery(mysql, query, function(error, results) {
			})
			
            if (message != "" && !botStartup && launcher != message ) {

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

    var statusurl = "https://forums.elderscrollsonline.com/en";

    request(statusurl, function(error, response, body) {
        if (error) {
            msg.channel.sendMessage("Sorry there was an unexpected connection error, please try again later." );

            console.log("Error: " + error);
        }else{
        var forumtxt = ""
        var $statusbin = 0;
        if (response.statusCode === 200) {
            var $ = cheerio.load(body);
        
        $('div[class="DismissMessage AlertMessage"]')
            .each(function() {
                $statusbin = 1;
                var $el = $(this);
                forumtxt += $(this).text();

            });
        if ($statusbin == "0") {					
			}           
        var query = "UPDATE `servers` SET time = NOW(), status = '" +forumtxt+ "' WHERE id = '_forums'";
        dh.mysqlQuery(mysql, query, function(error, results) {
		})}
		}
    });
    
});


//////////////////////////////////////////////////////////////////////////////////////////
/// TTC UPDATE

function ttcCreateItemTable(json, callback) {
  var queryPrep1 = 'TRUNCATE TABLE `items_ttc`;';
	var	fields = ['id','cat','name','language']
	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS `items_ttc` (id INT(20), cat INT(20), name TEXT, language VARCHAR(2));';	

 		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
      	console.log(getLogDate() + "items_ttc created " )
      	console.log(queryPrep2)
 		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {


	 	var sql = "INSERT INTO items_ttc  ("+ fields.join(",")+") VALUES ?;";
        var values = []
   
        var doneItems = []

        for (var i = 0; i < json.length; i++) {
            var counter = 0;
            for (var key in json[i].items) {
                if (doneItems.includes(key) == false) {
                	var tmparray = [json[i].items[key][Object.keys(json[i].items[key])[0]],Object.keys(json[i].items[key])[0], key, "EN"];
                	console.log(tmparray)
                    values.push(tmparray);
                    doneItems.push(key)
                    counter++;
                }
            }
            console.log(getLogDate() + "TTC items_ttc inserts: " + json[i].megaserver + " --> " + counter + " added")
        }  
        
            mysql.query(sql, [values], function(err) {
    			if (err) throw err;
	        callback(getLogDate() + "items_ttc have been updated")
			});
})})
}

function ttcCreateInfoTable(json, callback) {
  var queryPrep1 = 'TRUNCATE TABLE `items_prices_ttc_info`;';
	var	fields = ['id','megaserver','timestamp']
	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS `items_prices_ttc_info` (id INT(20), '+ fields.slice(1).join(' VARCHAR(20),')+' VARCHAR(20) );';	

 		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
      	console.log(getLogDate() + "items_prices_ttc created " )
      	console.log(queryPrep2)
 		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {

	 	var sql = "INSERT INTO items_prices_ttc_info  ("+ fields.join(",")+") VALUES ?;";
        var values = []

        for (var i = 0; i < json.length; i++) {
            values.push([i, json[i].megaserver, json[i].date]);
        }
            mysql.query(sql, [values], function(err) {
    			if (err) throw err;
	        callback(getLogDate() + "items_ttc_info have been updated")
			});
    })
	})
}

function insertVouchers(callback){
			var vquery1 = 'INSERT into items_prices_ttc (SELECT ANY_VALUE(items_prices_ttc.id), ANY_VALUE(megaserver), "99", ANY_VALUE(level), ANY_VALUE(trait), ANY_VALUE(category), ANY_VALUE(vouchers), SUM(countEntry), SUM(countAmount), ANY_VALUE(suggested), ROUND(AVG(avg)), MAX(max), MIN(min), null FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%sealed%writ%" AND vouchers >0 GROUP BY items_prices_ttc.id, megaserver, vouchers);'
			var vquery2 = 'DELETE FROM items_prices_ttc WHERE rowid IN (SELECT cid FROM (SELECT items_prices_ttc.rowid AS cid FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%sealed%writ%" AND NOT items_prices_ttc.quality = "99") AS c);'

	        mysql.query(vquery1, function(err) {
    				if (err) throw err;
	        	mysql.query(vquery2, function(err) {
    				if (err) throw err;
    			
	        		callback("items_prices_ttc vouchers have been updated")
			});
			});
/**
	INSERT into items_prices_ttc (SELECT items_prices_ttc.id, megaserver, "99", level, trait, category, vouchers, countEntry, countAmount, suggested, ROUND(AVG(avg)), MAX(max), MIN(min) FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%sealed%writ%" AND vouchers >0 GROUP BY items_prices_ttc.id, megaserver, vouchers);
	SELECT items_prices_ttc.* FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%sealed%writ%";

    
	DELETE FROM items_prices_ttc 
		WHERE id IN (
			SELECT cid FROM (
				SELECT items_prices_ttc.id AS cid FROM items_ttc, items_prices_ttc WHERE items_ttc.id  = items_prices_ttc.id AND items_ttc.name LIKE "%sealed%writ%" AND NOT items_prices_ttc.quality = "99"
				) 
			AS c
			);
*/

}

function ttcCreatePriceTable(jsonAll, callback) {
	var queryPrep1 = 'DROP TABLE IF EXISTS  `items_prices_ttc`;';
	var	fields = ['id','megaserver','quality','level','trait','category','vouchers','countEntry','countAmount','suggested','avg','max','min']
	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS `items_prices_ttc` (id INT(20), '+ fields.slice(1).join(' VARCHAR(20),')+' VARCHAR(20) );';	

	 	var sql = "INSERT INTO items_prices_ttc  ("+ fields.join(",")+") VALUES ?;";
	 	
 		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
      	console.log(getLogDate() + "items_prices_ttc created " )
      	console.log(queryPrep2)
 		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {
        var values = []

        for (var i = 0; i < jsonAll.length; i++) {
            var json = jsonAll[i].price
            var megaserver = jsonAll[i].megaserver
            console.log(getLogDate() + "TTC Preparing items_prices_ttc inserts: " + megaserver)

            
            traverse(json).forEach(function(x) {
                if (this.node["Min"]) {
                    var suggested = null;
                    if (this.node["SuggestedPrice"]) {
                        suggested = this.node["SuggestedPrice"]
                    }

                    if (this.level == 4) {
                        values.push([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], null, null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
                    } else if (this.level == 5) {
                        values.push([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], this.path[4], null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
                    } else if (this.level == 8) {

                        values.push([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], this.path[4],  this.path[6], this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
                        
                        // these are the writs
                    }
                }
            });
        }
            
            mysql.query(sql, [values], function(err) {
    			if (err) throw err;

                    	var qafter = "ALTER TABLE `items_prices_ttc` ADD COLUMN rowid INT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY; ALTER TABLE `items_prices_ttc` ADD index (id,quality,level,trait,vouchers); ALTER TABLE `items_ttc` ADD index (id);  ALTER TABLE `items_ttc` ADD FULLTEXT (name);"
	            		mysql.query(qafter, function(err) {
    						if (err) throw err;
	        				console.log(getLogDate() + "items_prices_ttc have been indexed ")
		
    				 	insertVouchers(function(result){
	        				console.log(getLogDate() + result)
    		        		callback(getLogDate() + "items_prices_ttc have been updated ")
                         webHooks.trigger('service', {
                            "content": "Update TTC: finished"
                        })   

//     						})
 						});
						});
            
        
 		
 		})
 		})})
}

var timestamp = "";

var ttcdownload = {
    "NA": "https://us.tamrieltradecentre.com/Download/PriceTable",
    "EU": "https://eu.tamrieltradecentre.com/Download/PriceTable"
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
			console.log(item)

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

            ttcCreateItemTable(alldata, function(resultItem) {
                console.log(resultItem);
                ttcCreateInfoTable(alldata, function(resultPrice) {
                    console.log(resultPrice)
                    ttcCreatePriceTable(alldata, function(resultInfo) {
                    	console.log(resultInfo)
                    });
                });
            });
        }) // end serialize
}) //schedule


/**
//////////////////////////////////////////////////////////////////////////////////////////
/// SALES UPDATE UESP

function uespsCreatePriceTable(json, callback) {
var table = "items_prices_uesp";

var fields = ["id","Item","Level","Quality","Item_ID","Internal_Level","Internal_Subtype","Item_Type","Equip_Type","Armor_Type","Weapon_Type","Set_Name","Extra_Data","Sales_Count","Sales_Items","Sales_Price","Last_Sale_Time","List_Count","List_Items","List_Price","Last_List_Time","Last_Seen_Time","Good_Price","Good_Sales_Price","Good_List_Price"]
    console.log(getLogDate() + "UESP "+table+" prepare " )
// 		console.log(util.inspect(json[0].items["body"][0]["body"][3]["variables"])) // 0 = server, 1 = version , 2 = SalesPricesLastUpdate, 3 = SalesPrices, 4 = SalesPricesDataCount
// 		console.log(util.inspect(json[0].items["body"][0]["body"][3]["init"][0]["fields"])) // 0 = server, 1 = version , 2 = SalesPricesLastUpdate, 3 = SalesPrices, 4 = SalesPricesDataCount
// 		console.log(util.inspect(json[0].items["body"][0]["body"][3]["init"][0]["fields"][0]["fields"])) // 0 = server, 1 = version , 2 = SalesPricesLastUpdate, 3 = SalesPrices, 4 = SalesPricesDataCount
// http://esosales.uesp.net/getSalesImage.php?id=79648&width=400&height=300&view=all&timeperiod=

		//  

// 		$this->ParseFormParam('text');
// 		$this->ParseFormParam('trait');
// 		$this->ParseFormParam('quality');+
// 		$this->ParseFormParam('itemtype');
// 		$this->ParseFormParam('equiptype');
// 		$this->ParseFormParam('armortype');
// 		$this->ParseFormParam('weapontype');
// 		$this->ParseFormParam('level');
// 		$this->ParseFormParam('timeperiod');
// 		$this->ParseFormParam('server');
// 		$this->ParseFormParam('saletype');

// 
// [84793]={ //id, same as images. trait specific
// 	[31]={ // lvl
// 		[2]={	// green
// 			[7]={ 
// 				[0]={199,199,0,1,0,1,0},
// 				},
// 			},
// 		 },
// 	[66]={ // lvl
// 		[3]={	//blue
// 			[7]={	
// 				[0]={175300,150300,200300,2,2,2,2},
// 				},
// 			},
// 		[4]={	//purple
// 			[7]={
// 				[0]={305994,237658,414873,6,8,6,8},	//averageAll,averageSold,averageListed,sales,listed, sales , listed
// 				},
// 			},
// 		[5]={	//legendary
// 			[7]={	// sharpened
// 				[0]={349992,399995,299990,1,1,1,1},
// 				},
// 			},
// 		},
// 	},
// 
// [ '1', 'items', '84793', '66', '4', '7', '0', '0' ] 305994
// [ '1', 'items', '84751', '66', '4', '3', '0', '0' ] 81166
// 
// http://esosales.uesp.net/getSalesImage.php?id=79648&width=1024&height=600&view=all&timeperiod=



traverse(json).forEach(function(x) {
 if (this.isLeaf) {
            console.log(this.path, this.node);
        }

})
	var queryPrep1 = 'TRUNCATE TABLE IF EXISTS `'+table+'`;';
	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS `'+table+'` (id INT(20), '+ fields.slice(1).join(' VARCHAR(20),')+' VARCHAR(20) );';	
	

	 	var sql = "INSERT INTO "+table+"  ("+ fields.join(",")+") VALUES ?;";
 		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
      	console.log(getLogDate() + "UESP "+table+" created " )
      	console.log(queryPrep2)
 		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {
 		
// 				
//  		var values = []
//  		
//         for (var i = 0; i < Object.keys(json[catergory]).length ; i++) {//Object.keys(json[catergory]).length
//          	var tmporg = json[catergory][i]
//          	var tmparray = []
//          	var tmpfield = []
//         	console.log(tmporg["id"])        	
//             for (var j = 0; j < Object.keys(tmporg).length; j++) {
// 				tmparray.push(tmporg[Object.keys(tmporg)[j]].replace(/"/g, "'"))
// 				tmpfield.push(Object.keys(tmporg)[j])
//        		}
//          //	console.log(tmparray)
// 			//values.push(tmparray);
// 			var sql = "INSERT INTO "+table+"  ("+ tmpfield.join(",")+') VALUES ("'+ tmparray.join('","')+'");'
//   			dh.mysqlQuery(mysql, sql, function(errorP3, resultsP3) {
//      			if (errorP3) throw errorP3;
//  			});
//         }
     	console.log(getLogDate() + "UESP "+table+" objects complete" )
//		console.log(sql)
   	
	    callback(getLogDate() + "UESP "+table+" tables have been updated")


		})
		})    	

 //   });
 // 
//     db.serialize(() => {
//         db.run('drop table prices'); //or drop the table first..
//         db.run('create table if not exists ' +
//             'prices (' +
//             'id numeric, ' +
//             'megaserver text, ' +
//             'quality numeric, ' +
//             'level numeric, ' +
//             'trait numeric, ' +
//             'category text, ' +
//             'vouchers numeric, ' +
//             'countEntry numeric, ' +
//             'countAmount numeric, ' +
//             'suggested numeric, ' +
//             'avg numeric, ' +
//             'max numeric, ' +
//             'min numeric)');
// 
//         var stmt = db.prepare('insert into prices values (?,?,?,?,?,?,?,?,?,?,?,?,?)');
// 
//         for (var i = 0; i < jsonAll.length; i++) {
//             var json = jsonAll[i].price
//             var megaserver = jsonAll[i].megaserver
//             console.log(getLogDate() + "TTC Preparing price table inserts: " + megaserver)
// 
//             var voucher = [];
 //            traverse(json).forEach(function(x) {
//                 if (this.node["Min"]) {
//                     var suggested = null;
//                     if (this.node["SuggestedPrice"]) {
//                         suggested = this.node["SuggestedPrice"]
//                     }
// 
//                     if (this.level == 4) {
//                         stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], null, null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
//                     } else if (this.level == 5) {
//                         stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], this.path[4], null, this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
//                     } else if (this.level == 8) {
//                         if (!voucher.includes(this.path[1])) {
// 
//                             voucher.push(this.path[1])
// 
//                         }
//                         stmt.run([this.path[0], megaserver, this.path[1], this.path[2], this.path[3], null, this.path[6], this.node["EntryCount"], this.node["AmountCount"], suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
// 
//                         // these are the writs
//                     }
//                 }
//             });
//         };
// 
//         stmt.finalize(function(result) {
//             callback(getLogDate() + "TTC Price tables have been updated: ")
//         });
//    });
}

var ttcdownload = {
    "us": "https://esosales.uesp.net/pricesNA/uespSalesPrices.lua",
    "eu": "https://esosales.uesp.net/pricesEU/uespSalesPrices.lua"
}

function UESPsalesUpdate(megaserver) {
    return new Promise((resolve) => {

        var path = process.cwd() + "/data/tmp/" + "UESPsales_" + moment().tz("Europe/Berlin").format("YYYY-MM-DD") + "_" + megaserver
        var zipfile = path + ".lua"


        var promiseDownload = new Promise((resolve, reject) => {
            fileExists(zipfile, function(err, exists) {

                //console.log(exists + zipfile)
                if (exists) {
                    console.log(getLogDate() + "UESPsales File exists: " + megaserver)
                    resolve();
                } else {
                    var stream = fs.createWriteStream(zipfile);
                    console.log(getLogDate() + "UESPsales Starting download: " + megaserver)
                    var requestTTC = https.get(ttcdownload[megaserver], function(response) {
                        response.pipe(stream);
                        response.on("end", function() { //waits for data to be consumed
                            // pipe has ended here, so we resolve the promise
                            console.log(getLogDate() + "UESPsales download complete: " + megaserver)
                            resolve();
                        });
                    });
                }

            }) // OUTPUTS: true or false             // var item = JSON.parse(contents);
// 


        }).then(function() {
            console.log(getLogDate() + "UESPsales Preparing Item table: " + megaserver)
            var contents = fs.readFileSync(zipfile, 'utf8');
           // var item = luaparse.parse(contents)
             contents = contents.replace(/\n/g, '').replace(/\["/g, '"').replace(/"\]/g, '"').replace(/\[/g, '"').replace(/\]/g, '"').replace(/,}/g, '}').replace(/=/g, ':');
         //    contents = contents.replace(/\{([0-9])/g, '{"$1').replace(/([0-9])\}/g, '$1"}').replace(/([0-9]),([0-9])/g, '$1","$2').replace(/([0-9]),([0-9])/g, '$1","$2')
             contents = contents.replace(/\{([0-9,.]*)\}/g, '[$1]')
             contents = contents.substring(contents.indexOf('{'), contents.lastIndexOf('}') + 1) //.substring(0, 50);
             
          //   console.log(contents)

		
             return(JSON.parse(contents))
        }).then(function(jsonitem) {
            resolve({
                megaserver: megaserver,
                items: jsonitem,
                date: moment().tz("Europe/Berlin").unix()
            })
        })
    }) // end return promis
}

var scheduleTTC = schedule.scheduleJob('0 0 6 * * 3', function(){
//var scheduleTTC = schedule.scheduleJob(debugtime, function() {
    webHooks.trigger('service', {
        "content": "Update UESPsales: started"
    })
    var promises = [];
    for (var i = 0; i < Object.keys(ttcdownload).length; i++) {
        promises.push(UESPsalesUpdate(Object.keys(ttcdownload)[i]))
    }

    Promise.all(promises).then(alldata => {
//    	console.log(alldata)
//         db.serialize(() => {
// 
//             uepssCreateItemTable(alldata, function(resultItem) {
//                 console.log(resultItem);
//                 ttcCreateInfoTable(alldata, function(resultPrice) {
//                     console.log(resultPrice)
                     uespsCreatePriceTable(alldata, function(resultInfo) {
                         console.log(resultInfo)
//                         webHooks.trigger('service', {
//                             "content": "Update TTC: finished"
//                         })
                     });
//                 });
//             });
//         }) // end serialize
     })
}) //schedule

**/

//////////////////////////////////////////////////////////////////////////////////////////
/// ITEMS UPDATE
// http://esolog.uesp.net/itemLink.php?itemid=70
// http://esoitem.uesp.net/item-70-66-5.png
const minedCSV = "http://esoitem.uesp.net/viewlog.php?record=setSummary&format=csv"
const esoitemUrl = "https://esolog.uesp.net/exportJson.php?table=setSummary"
const esoskillUrl = "https://esolog.uesp.net/exportJson.php?table=playerSkills"
// https://esolog.uesp.net/exportJson.php?table=cpSkills
const esoMineditemUrl =  "https://esolog.uesp.net/exportJson.php?table=minedItemSummary"
//curl -o itemSummary.csv "http://esoitem.uesp.net/viewlog.php?record=minedItemSummary&format=csv"
//curl -o itemComplete.csv "http://esoitem.uesp.net/viewlog.php?record=item&format=csv"
const itemForSet1 = "http://esoitem.uesp.net/dumpMinedItems.php?type=1&fields=setName,itemId,trait"	
const itemForSet2 = "http://esoitem.uesp.net/dumpMinedItems.php?type=2&fields=setName,itemId,trait"	

/// DOC: http://en.uesp.net/wiki/User:Daveh/ESO_Log_Collector#ItemLinkImage_Documentation

const itemdb = new sqlite3.Database('./data/dbs/item.db');
const skilldb = new sqlite3.Database('./data/dbs/skill.db');

function createEsoItemTable(db, json, callback) {
		
 //   db.serialize(() => {
    	var queryPrep1 = 'DROP TABLE IF EXISTS `items_sets`;\n';
    	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS '
    		queryPrep2 += '`items_sets` ( '+
            'id INTEGER, ' +
            'setName TEXT, ' +
            'setMaxEquipCount TEXT, ' +
            'setBonusCount TEXT, ' +
            'itemCount TEXT, ' +
            'setBonusDesc1 TEXT, ' +
            'setBonusDesc2 TEXT, ' +
            'setBonusDesc3 TEXT, ' +
            'setBonusDesc4 TEXT, ' +
            'setBonusDesc5 TEXT, ' +
            'setBonusDesc TEXT, ' +
            'itemSlots TEXT);';

		var sql = "INSERT INTO items_sets (id,setName,setMaxEquipCount,setBonusCount,itemCount,setBonusDesc1,setBonusDesc2,setBonusDesc3,setBonusDesc4,setBonusDesc5,setBonusDesc,itemSlots) VALUES ?;";
 		var values = []
 		
        for (var i = 0; i < json.setSummary.length; i++) {
		values.push([	json.setSummary[i]["id"], 
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
    	
		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {
		mysql.query(sql, [values], function(err) {
    		if (err) throw err;
    		mysql.end();
	        callback(getLogDate() + "EsoItem Set tables have been updated")
		});
		})})    	

 //   });
}

function createEsoTable(mysql, json, table, catergory, callback) {
    console.log(getLogDate() + "EsoItem "+table+" prepare " )
 	var fields = Object.keys(json[catergory][0])
	var queryPrep1 = 'TRUNCATE TABLE IF EXISTS `'+table+'`;';
	var	queryPrep2 = 'CREATE TABLE IF NOT EXISTS `'+table+'` (id INTEGER,'+ fields.slice(1).join(" TEXT,")+" TEXT );";	
 

		var sql = "INSERT INTO "+table+"  ("+ fields.join(",")+") VALUES ?;";
 		dh.mysqlQuery(mysql, queryPrep1, function(errorP1, resultsP1) {
      	console.log(getLogDate() + "EsoItem "+table+" created " )
 		dh.mysqlQuery(mysql, queryPrep2, function(errorP2, resultsP2) {
				
 		var values = []
 		
        for (var i = 0; i < Object.keys(json[catergory]).length ; i++) {//Object.keys(json[catergory]).length
         	var tmporg = json[catergory][i]
         	var tmparray = []
         	var tmpfield = []
        	console.log(tmporg["id"])        	
            for (var j = 0; j < Object.keys(tmporg).length; j++) {
				tmparray.push(tmporg[Object.keys(tmporg)[j]].replace(/"/g, "'"))
				tmpfield.push(Object.keys(tmporg)[j])
       		}
         //	console.log(tmparray)
			//values.push(tmparray);
			var sql = "INSERT INTO "+table+"  ("+ tmpfield.join(",")+') VALUES ("'+ tmparray.join('","')+'");'
  			dh.mysqlQuery(mysql, sql, function(errorP3, resultsP3) {
     			if (errorP3) throw errorP3;
 			});
        }
     	console.log(getLogDate() + "EsoItem "+table+" objects complete" )
		console.log(sql)
   	
	     callback(getLogDate() + "EsoItem "+table+" tables have been updated")


		})})    	

 //   });
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
/**    https.get(esoitemUrl, function(res) {
        var body = '';

    	res.on('data', function(chunk){
        	body += chunk;
    	});

    	res.on('end', function(){
        	var fbResponse = JSON.parse(body);
        	createEsoTable(mysql, fbResponse, "items_sets","setSummary", function(result){        	
//        	createEsoItemTable(itemdb, fbResponse, function(result){
        		console.log(result)
        	})
    	});
	}).on('error', function(e){
      	console.log("Got an error: ", e);
	});
**/
	var col = "ALTER TABLE items_sets ADD IF NOT EXITS COLUMN representative VARCHAR(20);"
  	// dh.mysqlQuery(mysql, col, function(errorP1, resultsP1) {
//  				if (errorP1) throw errorP1;
//  	});
			    
	var representatives = {}
	csv().fromStream(request.get(itemForSet1))
			.on('csv',(csvRow)=>{
				console.log(representatives[csvRow[0]]);
				if (typeof representatives[csvRow[0]] == "undefined" || csvRow[2] == "Sharpened"){
					representatives[csvRow[0]] = csvRow[1]
					console.log(representatives[csvRow[0]]);
					}
			})
			.on('done',(error)=>{
	csv().fromStream(request.get(itemForSet2))
			.on('csv',(csvRow)=>{
				if (typeof representatives[csvRow[0]] == "undefined" && csvRow[2] == "Divines"){
					representatives[csvRow[0]] = csvRow[1]
					console.log(representatives[csvRow[0]]);
					}
				if (typeof representatives[csvRow[0]] == "undefined"){
					representatives[csvRow[0]] = csvRow[1]
					}

			})
			.on('done',(error)=>{
		
				for (var key in representatives){
				console.log(key)
				if (key != ""){
				var sql = 'UPDATE items_sets SET representative = "'+ representatives[key]+'" WHERE setName LIKE "'+key+'";'
				console.log(sql)
  				dh.mysqlQuery(mysql, sql, function(errorP2, resultsP2) {
     				if (errorP2) throw errorP2;
 				});
 				}
 				}			
		})			
		})



	
//     console.log(getLogDate() + "EsoItem Starting Full Item download " )
// 	
//     https.get(esoMineditemUrl, function(res) {
//         var body = '';
// 
//     	res.on('data', function(chunk){
//         	body += chunk;
//     	});
// 
//     	res.on('end', function(){
//         	var fbResponse = JSON.parse(body);
//         	createEsoTable(mysql, fbResponse, "items_summary","minedItemSummary", function(result){
//         		console.log(result)
//         	})
//     	});
// 	}).on('error', function(e){
//       	console.log("Got an error: ", e);
// 	});
// 	
//     console.log(getLogDate() + "EsoSkill Starting Skill download " )
//     https.get(esoskillUrl, function(res) {
//         var body = '';
// 
//     	res.on('data', function(chunk){
//         	body += chunk;
//     	});
// 
//     	res.on('end', function(){
//         	var sbResponse = JSON.parse(body);    	
//             	createEsoSkillTable(skilldb, sbResponse, function(result){
//         		console.log(result)
//                         webHooks.trigger('service', {
//                             "content": "Update ESO skills/sets: finished"
//                         })
//         	})
//     	});
// 	}).on('error', function(e){
//       	console.log("Got an error: ", e);
// 	});



})

console.log("Tasking activated")



