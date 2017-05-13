// TO DO: add documentation
// TO DO: beautify return text

const sqlite3 = require('sqlite3').verbose();
const cheerio = require('cheerio');
const request = require("request");
const moment = require('moment-timezone');
var schedule = require('node-schedule');
var db = new sqlite3.Database('./data/history_golden.sqlite');

// Functions:
// need to get dates with zeros padded on days/months <10
function pad(n) {
    return n < 10 ? '0' + n : n
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


function getDbMaxId(db, callback) {
	db.all("SELECT MAX(dateid) FROM golden", function(err, all) {
        if (err){console.log(err)};
        callback(err, all);  
    });
}; 


function getDbRecords(db, args, callback) {
//        console.log(args)

    db.all("SELECT * FROM golden WHERE dateid IS "+args, function(err, all) {


        if (err){console.log(err)};
   //     console.log(all)
        callback(err, all, args);  
    });
}; 

function getDbInserts(db, args, callback) {
	
getDbMaxId(db, function(err, all) { 
	var day = Number(all[0]['MAX(dateid)'])+1;

	db.each("INSERT into golden (dateid, date, item) VALUES ('"+day+"', '"+args[0]+"', '"+args[1]+"')", function(err, row) {
		if (err){
			console.log(err)
		}else{

		}	
	});
	
})
}; 

// Data:
// URL of the golden history
var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";

var j = schedule.scheduleJob('1 59 * * 6', function(){		// vendor comes online, try to refresh stores
//var j = schedule.scheduleJob('27 16 * * 5', function(){

	// current date
	var searchdate = moment().tz("America/New_York").format("YYYY-MM-DD");
	//var searchdate = new Date(Date.now()).toISOString().substring(0, 10);
//	var searchdate = new Date(Date.parse("April 29, 2017")).toISOString().substring(0, 10); // just for control
	
	console.log( "Golden Vendor came online, refreshing: " + searchdate);
	
	let startTime = new Date(Date.now()+5000);
	let endTime = new Date(startTime.getTime() + 60000 * 10); // do the searching for 10 minutes after start
	
	console.log (startTime + "-->"+ endTime)
	var k = schedule.scheduleJob({ start: startTime, end: endTime, rule: '10 * * * * *' }, function(){	// refresh every minute	
		var goldentext = "";
	
		request(goldenurl, function(error, response, body) {
            if (error) {
                // on error
                console.log("Error: " + error);
            } else {
				// check wether we got a website (redundant to previous check?)
                if (response.statusCode === 200) {
                    var $ = cheerio.load(body);
                }

                // check today, yesterday and day before whether there is a hit
          //      for (var i = 0, len = lookupdates.length; i < len; i++) {
          
                	//scrape the site for the day
                    results = $('h3').filter(function() {
                            return $(this).text().trim() === searchdate;
                        }).next('ul')
                        .find('li')
                        .each(function() {
                            var $el = $(this);
                            // extend the return message by all hits
                            goldentext += " * " + $(this).text() + "\n";
                    		var argsg =  [searchdate,$(this).text()]
							getDbInserts(db, argsg)

                        }); // end each
         //       } // end for dates

            } // end check for successful request
		if(goldentext == ""){
			console.log("FAILED vendor update: " + new Date(Date.now()));
		
		}else{
			console.log("SUCCESS vendor update: "+ new Date(Date.now()));
			console.log(goldentext);			
			k.cancel()
		}

        }); // end request
        	
	});
});



// return of the module
module.exports = (bot, msg, gsDayNames, request, cheerio, Discord) => {

var args = msg.content.split(" ").slice(1);
var embedHistory = new Discord.RichEmbed()
var embed = new Discord.RichEmbed()
embed.setAuthor("Adhazabi Aba-daro the Golden says")//,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
embed.setColor(0x800000)
embedHistory.setColor(0x800000)
    
if (args[0]){

getDbMaxId(db,  function(err, all) { 
	
	var requestday = Number(all[0]['MAX(dateid)'])+1;
	var requestdiff = Number(args[0].replace(/\"/g, "").replace(/ /g, ""));
	var lagacytxt = ""

	if (isNumeric(requestdiff)){

	if (requestdiff < 0 & -requestdiff < requestday){ 
	}else if(requestdiff > 0){
		requestdiff = - requestdiff;
	}else if(requestdiff == 0){
		requestdiff = -1;
	}else{
		requestdiff = -1;
	}
	
	requestday = requestday + requestdiff

	if (requestday < Number(all[0]['MAX(dateid)'])+1){	
	getDbRecords(db, requestday, function(err, all, args) {    
	
		if (all.length > 0){
	//	console.log(all)

		all.forEach(function(obj) { 
			lagacytxt += "\n* "+ obj.item;
		});
	
		}
		
		embedHistory.addField("With fair and low prices, this honest cat sold " + -requestdiff + " weeks ago:", lagacytxt+"\n\nIt is not Adhazabi's fault, and can not take back this, if a buyer has trouble to kill well with it. ")		
		embedHistory.setFooter("Khajiit got this data from www.benevolentbowd.ca")		
		msg.channel.sendEmbed(embedHistory);				

	});

	}else{
		embedHistory.setDescription("Khajiit does not understand your talk, you have to tell her \n**!golden** for todays wares\n**!golden -1** for last week,\n**!golden -13** for 13 weeks ago.")		
		msg.channel.sendEmbed(embedHistory);
	}
	}
})
}else{
	embed.setDescription("This cat can also tell you what she sold you in the previous weeks. You have to tell her \n**!golden -1** for last week,\n**!golden -13** for 13 weeks ago.")
}				
	// get the dates when she comes online and goes back off
	var vendorOn = moment().startOf('isoweek').add(5,'days').add(2,'hours')
	var vendorOnDate = vendorOn.tz("Europe/Berlin").unix()
	var vendorOffDate = vendorOn.add(48,'hours').tz("Europe/Berlin").unix()

	var remainingOn = moment.unix(vendorOnDate).fromNow();
	var remainingOff = moment.unix(vendorOffDate).fromNow();
	//console.log(remainingOn +"-->"+remainingOff)

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

	if (remainingOn.startsWith("in")){
	
			embed.addField("This cat's store has not yet opened.","Adhazabi will start to sell some beautiful wares " + remainingOn + ", this she can tell.")		
			msg.channel.sendEmbed(embed);	
	} else{

    if (dayName == 'Sunday' || dayName == 'Saturday') {
		// weekend:
		
        // do the web scraping, not nice, but works
        request(goldenurl, function(error, response, body) {
            if (error) {
                // on error
                msg.channel.sendMessage("Sorry there was an unexpected problem, please try again later.");
                console.log("Error: " + error);
            } else {
				
				// check wether we got a website (redundant to previous check?)
                if (response.statusCode === 200) {
                    var $ = cheerio.load(body);
                }

                // starting the return text (redundant to previous?)
                goldentext += "This weekend, Adhazabi has plenty of \n";

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
                        text: 'Khajiit got this data from www.benevolentbowd.ca'
                    }
                }); // end message
            } // end check for successful request
        }); // end request
    }    
   		//	embed.setFooter('Data obtained from www.benevolentbowd.ca')
			embed.addField("Hurry up with your dealings","Adhazabi will close her crates again " + remainingOff + ".")		
			msg.channel.sendEmbed(embed);				
	} 
};

