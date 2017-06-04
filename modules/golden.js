// TO DO: add documentation
// TO DO: beautify return text

const sqlite3 = require('sqlite3').verbose();
const cheerio = require('cheerio');
const request = require("request");
const moment = require('moment-timezone');

const mh = require("../helper/messages.js")

var db = new sqlite3.Database('./data/history_golden.sqlite');
var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";

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

// return of the module
module.exports = (bot, msg, gsDayNames, request, cheerio, Discord) => {

var args = msg.content.split(" ").slice(1);
var embed = mh.prepare(Discord)
embed.setAuthor("Adhazabi Aba-daro the Golden says")//,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")

var embedHistory = embed

    
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
		mh.send("",embedHistory,msg);				

	});

	}else{
		embedHistory.setDescription("Khajiit does not understand your talk, you have to tell her \n**!golden** for todays wares\n**!golden -1** for last week,\n**!golden -13** for 13 weeks ago.")		
		mh.send("",embedHistory,msg);				
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
			mh.send("",embed,msg);	
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
				var embedCurrent = mh.prepare(Discord)
//				embedCurrent.setAuthor("Adhazabi Aba-daro the Golden says")//,"http://images.uesp.net//9/94/ON-icon-skill-Undaunted-Blood_Altar.png")
				embedCurrent.setFooter("Khajiit got this from www.benevolentbowd.ca")
                embedCurrent.setTitle("This weekend, Adhazabi has plenty of");
				embedCurrent.setDescription(goldentext)
				mh.send(msg,embedCurrent);	

            } // end check for successful request
        }); // end request
    }    
   		//	embed.setFooter('Data obtained from www.benevolentbowd.ca')
			embed.addField("Hurry up with your dealings","Adhazabi will close her crates again " + remainingOff + ".")		
			mh.send(msg.channel,embed);	
	} 
};

