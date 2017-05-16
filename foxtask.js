const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const util = require('util')
const traverse = require('traverse');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const https = require('https');
var WebHooks = require('node-webhooks')
 
 
var webHooks = new WebHooks({
    db: './webHooksDB.json', // json file that store webhook URLs 
})
 
// sync instantation - add a new webhook called 'shortname1' 
webHooks.add('foxhook', 'https://discordapp.com/api/webhooks/308950470293192706/ZF4lmpAhReO-WuAAfJJjnwQ1ztyV_GXSYnn6RoK3QLkKcuSwHsXcRRMdiJsIwupiRkKb').then(function(){
    // done 
}).catch(function(err){
    console.log(err)
})


const db   = new sqlite3.Database('./data/dbs/ttc.db');
const realmStatus = ['live-services.elderscrollsonline.com','/status/realms'];
const launcherMessage = ['live-services.elderscrollsonline.com', '/announcement/message?announcer_id=2'];

var timestamp = "";
var megaserver = "EU";


///// TTC FUNCTIONS
function create_table(json, megaserver) {

  db.serialize( () => {
    db.run('drop table items'); //or drop the table first..
    db.run('create table if not exists '
          + 'items ('
          + 'id numeric primary key, '
          + 'megaserver text, '
          + 'name text)');

    var stmt = db.prepare('insert into items values (?,?,?)');
	
	for (var key in json) {
 	   let value = json[key];
       stmt.run([value, megaserver, key]);
	}
	stmt.finalize();

  });

}

function create_table_price(json, smegaserver) {

  db.serialize( () => {
    db.run('drop table info'); //or drop the table first..
    db.run('drop table prices'); //or drop the table first..
    db.run('create table if not exists '
          	+ 'prices ('
          	+ 'id numeric, '
          	+ 'megaserver text, '
          	+ 'quality numeric, '
           	+ 'level numeric, '
      	 	+ 'trait numeric, '
          	+ 'category text, '
           	+ 'vouchers numeric, '
           	+ 'countEntry numeric, '
           	+ 'countAmount numeric, '
           	+ 'suggested numeric, '
           	+ 'avg numeric, '
           	+ 'max numeric, '
          	+ 'min numeric)');

 //   db.run('drop table info'); //or drop the table first..
    db.run('create table if not exists '
          	+ 'info ('
           	+ 'megaserver text, '
          	+ 'timestamp text)');
          	
    var stmt = db.prepare('insert into prices values (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    var stmt2 = db.prepare('insert into info values (?,?)');

var voucher = [];
traverse(json).forEach(function (x) {
    if (this.node["Min"]){ 
   		var suggested = null;
   		if (this.node["SuggestedPrice"]){
   			suggested = this.node["SuggestedPrice"]
   		}
   		
    	if (this.level == 5){ 
        	stmt.run([this.path[1], megaserver, this.path[2], this.path[3],this.path[4], null, null,this.node["EntryCount"], this.node["AmountCount"],suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
    	}else if (this.level == 6){
        	stmt.run([this.path[1], megaserver, this.path[2], this.path[3],this.path[4], this.path[5], null,this.node["EntryCount"], this.node["AmountCount"],suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);
    	}else if (this.level == 9){
    		if (!voucher.includes(this.path[1])){
    		
    			voucher.push(this.path[1])
    		
    		}
        	stmt.run([this.path[1], megaserver, this.path[2], this.path[3],this.path[4], null, this.path[7], this.node["EntryCount"], this.node["AmountCount"],suggested, this.node["Avg"], this.node["Max"], this.node["Min"]]);

    		// these are the writs
    	}
    }
    if(this.node["TimeStamp"]){
        	stmt2.run([megaserver, this.node["TimeStamp"]]); 
    }

});



 	stmt.finalize();

  });
}

///// STATUS FUNCTIONS
function getXml(uri, callback) {
    https.get({
        host: uri[0],
        path: uri[1]
    }, function (response) {
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            callback(body);
        });
    });
}


/// REALM STATUS UPDATE
var maint = {};
if (!maint['lastStatusCheck'])
    maint['lastStatusCheck'] = moment().unix();

var realmupdate = schedule.scheduleJob('*/1 * * * *', function(){
	console.log("Realm update started")
	   getXml(realmStatus, function (data) {
        let dirty = false;
        data = JSON.parse(data);
        let r = data['zos_platform_response'];
        if (!r)
            return;

        r = r['response'];
        if (!r)
            return;

        r = r['The Elder Scrolls Online (NA)'];

        if (!maint['lastStatus'] || maint['lastStatus'] != r) {
                          console.log('NA PC server status is now ' + r);               
                          webHooks.trigger('foxhook', {"username":"The Watcher","title": "Status update","content":'NA PC server status is now ' + r})
           dirty = true;
            maint['lastStatus'] = r;
        }

        getXml(launcherMessage, function (data) {
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

            if (!maint['lastMessage'] || maint['lastMessage'] != message) {
            
                console.log('Launcher Message:\n' + message);

                dirty = true;
                maint['lastMessage'] = message;
            }

            maint['lastStatusCheck'] = moment().unix();
        });
    });
	
	
});

return;

/// TTC UPDATE
var itemtable = "/Users/alexanderkeller/Downloads/PriceTable/ItemLookUpTable_EN.lua"
var pricetable = "/Users/alexanderkeller/Downloads/PriceTable/PriceTable.lua"

var contents = fs.readFileSync(itemtable, 'utf8');
    contents = contents.replace(/\["/g, '"').replace(/"\]/g, '"').replace(/\[/g, '"').replace(/\]/g, '"').replace(/,}/g, '}').replace(/=/g, ':');
    contents = contents.substring(contents.indexOf('{'), contents.lastIndexOf('}')+1);
    //Write to file

  //  fs.writeFileSync(itemtable+".json", contents, 'utf8');

console.log("Importing Item table")

var jsonitem = JSON.parse(contents,  megaserver);

//console.log(json["yew shield"])
create_table(jsonitem);

var contents_price = fs.readFileSync(pricetable, 'utf8');
    contents_price = contents_price.replace(/\["/g, '"').replace(/"\]/g, '"').replace(/\[/g, '"').replace(/\]/g, '"').replace(/,}/g, '}').replace(/=/g, ':');
    contents_price = contents_price.substring(contents_price.indexOf('{'), contents_price.lastIndexOf('}')+1);
    //Write to file

//    fs.writeFileSync(itemtable+".json", contents, 'utf8');

console.log("Importing Price table")

var jsonprice = JSON.parse(contents_price, megaserver);

create_table_price(jsonprice);
