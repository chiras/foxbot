// npm i --save --no-optional discord.js
// npm i --save --no-optional https://github.com/request/request
const util = require('util')

var Discord = require("discord.js");
var GoogleSearch = require('google-search');
var GoogleSpreadsheets = require('google-spreadsheets');
var google = require('googleapis');
var request = require("request")
var cheerio = require('cheerio');
var fs = require('fs');
var URL = require('url-parse');

var bot = new Discord.Client();

//var oauth2Client = new google.auth.OAuth2("402641743656-424viil7o7v6qdatt23j3mj6pcjnqd8m.apps.googleusercontent.com"
//, "5cMVSgpU9OIlx_Sa-2KxzumC", "");

// oauth2Client.setCredentials({
//     access_token: ACCESS_TOKEN,
//     refresh_token: REFRESH_TOKEN
// });
//  


var googleSearch = new GoogleSearch({
  key: 'AIzaSyDMFcbcFtKs2aZjeh4CUx3WHD3FNOyUMJ8',
  cx: '002910487085491670576:wo2xnmwbmuu'
});

var logfile = "requests.log";
var setfile = "setfile.txt";

var gsDayNames = new Array(
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
);

var pledgeurl = "https://esoleaderboards.com/api/getpledges.php"
var pledgetimeurl = "https://esoleaderboards.com"
var goldenurl = "http://benevolentbowd.ca/games/esotu/esotu-chronicle-of-alliance-point-vendor-items/";
var statusurl = "https://forums.elderscrollsonline.com/en";

var monster = new Object();
var sets = new Object();

var hmonster = new Object()
var hsets = new Object()


// console.log("Visiting page " + pageToVisit);

  GoogleSpreadsheets({
//  	key: '11BUMymPsNhkZ2zBqwSx5IZGj9ua55MjgM16kU0k1s80'//,
    key: '1uvlekv_QIvcwTq_fRDBVrFpHzrBy2XmTBviBRNsi5Ic'//,
//    auth: oauth2Client
}, function(err, spreadsheet) {

  	console.log("Set Spreadsheat loaded" + spreadsheet.title);

    spreadsheet.worksheets[0].cells({
        //range: 'R1C1:R5C5'
    }, function(err, cells) {
        //	console.log("Worksheet" + util.inspect(cells, false, null));
        //	var monsterutil = util.inspect(cells, false, null)
        //	fs.appendFile(setfile, monsterutil, function (err) {});



        	
        	console.log("Number of Normal Set items:" + Object.keys(cells.cells).length);
        	
        	sets = cells;

			
			for (var i=0; i <  Object.keys(cells.cells).length; i++) {
				if (typeof cells.cells[i] != "undefined") {
			//		console.log(i + "---------------" + JSON.stringify(cells.cells[i][1].value))
					hsets[JSON.stringify(cells.cells[i][1].value)] = i;
					
					outputdump = JSON.stringify(sets.cells[i][1].value) + "\t"
				if (sets.cells[i].hasOwnProperty(2)) {	outputdump += JSON.stringify(sets.cells[i][2].value) + "\t"}else{outputdump += "\t"};	
				if (sets.cells[i].hasOwnProperty(3)) {	outputdump += JSON.stringify(sets.cells[i][3].value) + "\t"}else{outputdump += "\t"};	
				if (sets.cells[i].hasOwnProperty(4)) {	outputdump += JSON.stringify(sets.cells[i][4].value) + "\t"}else{outputdump += "\t"};	
				if (sets.cells[i].hasOwnProperty(5)) {	outputdump += JSON.stringify(sets.cells[i][5].value) + "\t"}else{outputdump += "\t"};	
				if (sets.cells[i].hasOwnProperty(6)) {	outputdump += JSON.stringify(sets.cells[i][6].value) + "\t"}else{outputdump += "\t"};	
        		if (sets.cells[i].hasOwnProperty(7)) {outputdump += JSON.stringify(sets.cells[i][7].value) + "\t"}else{outputdump += "\t"};		
        		if (sets.cells[i].hasOwnProperty(8)) {outputdump += JSON.stringify(sets.cells[i][8].value) + "\t"}else{outputdump += "\t"};	
        		outputdump += "\n";	
        		fs.appendFile(setfile, outputdump, function (err) {});
    			}
			}

    });
		
    spreadsheet.worksheets[1].cells({
    }, function(err, cells) {
        //	console.log("Worksheet" + util.inspect(cells, false, null));
         // 	var monsterutil = util.inspect(cells, false, null)
        //	fs.appendFile(monsterfile, monsterutil, function (err) {});
      	
        	console.log("Number of Monster items:" + Object.keys(cells.cells).length);
        	
        	monster = cells;

			
			for (var i=0; i <  Object.keys(cells.cells).length; i++) {
				if (typeof cells.cells[i] != "undefined") {
			//		console.log(i + "---------------" + JSON.stringify(cells.cells[i][1].value))
					hmonster[JSON.stringify(cells.cells[i][1].value)] = i;
					
					outputdump = JSON.stringify(monster.cells[i][1].value) + "\t"
				if (monster.cells[i].hasOwnProperty(2)) {	outputdump += JSON.stringify(monster.cells[i][2].value) + "\t"}else{outputdump += "\t"};	
				if (monster.cells[i].hasOwnProperty(3)) {	outputdump += JSON.stringify(monster.cells[i][3].value) + "\t"}else{outputdump += "\t"};	
				if (monster.cells[i].hasOwnProperty(4)) {	outputdump += JSON.stringify(monster.cells[i][4].value) + "\t"}else{outputdump += "\t"};	
				if (monster.cells[i].hasOwnProperty(5)) {	outputdump += JSON.stringify(monster.cells[i][5].value) + "\t"}else{outputdump += "\t"};	
				if (monster.cells[i].hasOwnProperty(6)) {	outputdump += JSON.stringify(monster.cells[i][6].value) + "\t"}else{outputdump += "\t"};	
        		if (monster.cells[i].hasOwnProperty(7)) {outputdump += JSON.stringify(monster.cells[i][7].value) + "\t"}else{outputdump += "\t"};		
        		if (monster.cells[i].hasOwnProperty(8)) {outputdump += JSON.stringify(monster.cells[i][8].value) + "\t"}else{outputdump += "\t"};	
        		outputdump += "\n";	
        		fs.appendFile(setfile, outputdump, function (err) {});
 				}
			}

    });
    

}); 

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
 
bot.on("message", (msg) => {
  // Set the prefix
  let prefix = "!";
  // Exit and stop if it's not there
  if(!msg.content.startsWith(prefix)) return;
  if(msg.author.bot) return;  

  if (msg.content.startsWith(prefix + "pledges")) {
  
  
	request({
	    url: pledgeurl,
    	json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {
        //	console.log(body) // Print the json response
        console.log(`Pledge-Request ("${msg.createdAt}"): "${msg.author.username}" of "${msg.guild.name}"` );
		var requesttext = "Pledge-Request (" + msg.createdAt + "): " + msg.author.username + " of " + msg.guild.name +"\n";
		
		fs.appendFile(logfile, requesttext, function (err) {});
		
	    msg.channel.sendMessage("Pledges today are: " + JSON.stringify(body[1]) + ", "+ JSON.stringify(body[2]) + " and "+ JSON.stringify(body[3]) + "!");
    	}
	})
	
   request(pledgetimeurl, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }

    if(response.statusCode === 200) {
    	 var $ = cheerio.load(body);
	   }
 	$('p[class="type"]')
  	.each(function() {
  	  var $el = $(this);
  	  if ($(this).text().substring(0, 5) == " Next"){
	    msg.channel.sendMessage($(this).text());
    	}
	 });  

    });
  
  } 

  else if (msg.content.startsWith(prefix + "fox")) {
    msg.channel.sendMessage("Yeah, the FOX!");
  }
  
  else if (msg.content.startsWith(prefix + "help")) {
    msg.channel.sendMessage("Options:");
    msg.channel.sendMessage(" * !golden -> Golden Vendor Items");
    msg.channel.sendMessage(" * !pledges -> Today's Pledges");
    msg.channel.sendMessage(" * !status -> ESO Server Status");
  } 
  else if (msg.content.startsWith(prefix + "set")){
  
  	let [set] = msg.content.split(" ").slice(1);

  		var matches_sets =[];
  		var matches_monster =[];

		var filter = new RegExp(set, "i")
		
			for (var k in hsets) {
			    if (hsets.hasOwnProperty(k)) {
  				 if (k.match(filter)){
  					 matches_sets.push(hsets[k]);
  				 }
  				 }
			}
			
			for (var k in hmonster) {
			    if (hmonster.hasOwnProperty(k)) {
  				 if (k.match(filter)){
  					 matches_monster.push(hmonster[k]);
  				 }}
			}
			
			console.log("matches:" +matches_sets);

        	msg.channel.sendMessage("** ### Dropped Sets matching your criteria ### **\n\n");

        	for (var i=0; i <  matches_sets.length; i++) {
        	if (sets.cells[matches_sets[i]].hasOwnProperty(3)) {
        	
        	var outputsets = "";

         		outputsets += "**"  + JSON.stringify(sets.cells[matches_sets[i]][1].value)+ "** (" + JSON.stringify(sets.cells[matches_sets[i]][2].value) + ")" + " obtainable from ";
          		outputsets += JSON.stringify(sets.cells[matches_sets[i]][3].value) + "\n";
         		outputsets += "(2) " + JSON.stringify(sets.cells[matches_sets[i]][5].value) + "\n";
        		outputsets += "(3) " + JSON.stringify(sets.cells[matches_sets[i]][6].value) + "\n";		
        		if (sets.cells[matches_sets[i]].hasOwnProperty(7)) {outputsets += "(4) " + JSON.stringify(sets.cells[matches_sets[i]][7].value) + "\n"};		
        		if (sets.cells[matches_sets[i]].hasOwnProperty(8)) {outputsets += "(5) " + JSON.stringify(sets.cells[matches_sets[i]][8].value) + "\n\n"};		
        	
        	//console.log(util.inspect(sets.cells[matches_sets[i]], false, null));
        	
        	var outputsetsesc = outputsets.replace(/\\n/g, " ");
        	
        	msg.channel.sendMessage(outputsetsesc);

       		}}
       		
            msg.channel.sendMessage("** ### Craftable Sets matching your criteria ### **\n\n");
        	for (var i=0; i <  matches_sets.length; i++) {
  		    var outputsets = "";

       		if (isNumber(sets.cells[matches_sets[i]][2].value)) {
         		outputsets += "**"  + JSON.stringify(sets.cells[matches_sets[i]][1].value)+ "** (" + JSON.stringify(sets.cells[matches_sets[i]][2].value) + "Traits)" + " (more info soon) ";
       		
       		 var outputsetsesc = outputsets.replace(/\\n/g, " ");
        	msg.channel.sendMessage(outputsetsesc);

       		
       		}}



            msg.channel.sendMessage("** ### Monster Sets matching your criteria ### **\n\n");
                    	
        	for (var i=0; i <  matches_monster.length; i++) {
             	var outputmonster = "";

        	//	console.log("--------------------------");       	
        	//	console.log(matches_array[i]);       	
         		outputmonster += "**"  + JSON.stringify(monster.cells[matches_monster[i]][1].value) + "** obtainable from ";
          		outputmonster += JSON.stringify(monster.cells[matches_monster[i]][2].value) + "\n";
         		outputmonster += "(1) " + JSON.stringify(monster.cells[matches_monster[i]][3].value) + "\n";
        		outputmonster += "(2) " + JSON.stringify(monster.cells[matches_monster[i]][4].value) + "\n\n";	
        		
      		  	var outputmonsteresc = outputmonster.replace(/\\n/g, " ");
  				msg.channel.sendMessage(outputmonsteresc);
	
       		}        	


  
//   	googleSearch.build({
//   		q: set,
//  		num: 1, // Number of search results to return between 1 and 10, inclusive 
//   		siteSearch: "http://elderscrollsonline.wiki.fextralife.com/" // Restricts results to URLs from a specified site 
// 	}, function(error, response) {
//   		console.log(response.items[0].link);
//   		
//   		//
//   			   request(response.items[0].link, function(error, response, body) {
//  				  if(error) {
//     				 console.log("Error: " + error);
//   				 }
// 
//     			if(response.statusCode === 200) {
//     	 			var $ = cheerio.load(body);
// 	   			}
//  					$('table[class="wiki_table"]')
//  					.find('tr')
//  					.find('h2')
//   					.each(function() {
// 	    				msg.channel.sendMessage(" Information about the " + $(this).text() + " (CP160, Golden quality)");
//     				})
//     				.parent()
//     				.parent()
//     				.parent()
//     				.find("tr")
//     				.next()
//     				.find("p")
// 					.each(function() {
//   						msg.channel.sendMessage(" -  " + $(this).text());	
// 	 				})
// 	   				.find('ul')
//   					.find('li')
// 					.each(function() {
//   						msg.channel.sendMessage(" -  " + $(this).text());	
// 	 				});  
// 	 							
//     		});
//			msg.channel.sendMessage("More infos here: " + response.items[0].link);

  		//
  		
//	});


  }
  else if (msg.content.startsWith(prefix + "status")) {
	   request(statusurl, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }

    if(response.statusCode === 200) {
    	 var $ = cheerio.load(body);
	   }
 	$('div[class="DismissMessage AlertMessage"]')
  	.each(function() {
  	  var $el = $(this);
    msg.channel.sendMessage(" * " + $(this).text());
	 });  

    });
	}
  
  else if (msg.content.startsWith(prefix + "golden")) {
	console.log(`Vendor-Request ("${msg.createdAt}"): "${msg.author.username}" of "${msg.guild.name}"` );
	
	var requesttext = "Vendor-Request (" + msg.createdAt + "): " + msg.author.username + " of " + msg.guild.name +"\n";
	fs.appendFile(logfile, requesttext, function (err) {});
	
	var dateObj = new Date();

	var time = dateObj.getTime(); //months from 1-12
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();

	newdate = year + "" + month ;
	newdateday = day + "." + month + "." + year ;
	newdateday2 = year+ "-" + month + "-" + day ;



	var d = new Date(newdateday2);
	var dayName = gsDayNames[d.getDay()];
	console.log(`Today is !!!"${dayName}" the "${newdateday2}": "${time}"` );


//   if (dayName == 'Friday' || dayName == 'Sunday' || dayName == 'Saturday'){
   if (dayName == 'Sunday' || dayName == 'Saturday'){
   request(goldenurl, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }

   if(response.statusCode === 200) {
     var $ = cheerio.load(body);
   }

 	$('h2[id="'+newdate+'"]')
 	.next('h3')
  	.each(function() {
  	  var $el = $(this);
      var datex =  $(this).text()
      msg.channel.sendMessage("This weekend ("+datex+"), the Golden Vendor sells: "); 
	 })  
  	.next('ul')
  	.find('li')
  	.each(function() {
  	  var $el = $(this);
    msg.channel.sendMessage(" * " + $(this).text());
	 });  
	});

  }else{
      msg.channel.sendMessage("It's not weekend, nothing to sell. Sorry!");
  } // end else
  }
});


bot.on('ready', () => {
  console.log('I am ready!');
});
bot.login("MjUyMDE0NTMyNDQ3MzA1NzM5.CxtTkg.2zw21A9Ky0zwDiH-LfFyLpm1ybU");
