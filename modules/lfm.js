const moment = require('moment-timezone');
const Promise = require('bluebird');
const Q = require('q');

  function setupTasks(lfmtext) {
  		 lfmtext += "dddds";
  }

  function processEachTask(db, filter, timepoint,lfmtext) {

	db.each("SELECT name, searching, time FROM lfg WHERE searching IS '"+filter+"' ORDER BY time", function(err, row) {
		var elapsed = 	timepoint - row.time;
   		let diff = Math.floor(elapsed / 86400) + 1;
    	var elapsedH = Math.floor((elapsed % 86400) / 3600);
    	var elapsedM = Math.floor(((elapsed % 86400) / 60) % 60);
    
    	lfmtext += row.name + " searched " + elapsedH + " hours and "+ elapsedM+ " minutes ago\n"
    	console.log(lfmtext)
    });
     
     return(lfmtext)       
  }


function afterAllTasks(lfmtext,msg,filter) {

   msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : "Other players searching for " + filter,
  					value : "a: "+lfmtext
  				}],
	});	  
}
  

      

module.exports = (bot, msg, db, lfmtext) => {

var timepoint = moment().unix();
var filter = msg.content.split(" ").slice(1)

//async.forEach(setupTasks(lfmtext), processEachTask(db, filter, timepoint,lfmtext), afterAllTasks(lfmtext,msg,filter));


    var display_promise = Q-denodeify(processEachTask)
    
    Promise.map(function(lfmtext) {
	db.each("SELECT name, searching, time FROM lfg WHERE searching IS '"+filter+"' ORDER BY time", function(err, row) {
		var elapsed = 	timepoint - row.time;
   		let diff = Math.floor(elapsed / 86400) + 1;
    	var elapsedH = Math.floor((elapsed % 86400) / 3600);
    	var elapsedM = Math.floor(((elapsed % 86400) / 60) % 60);
    
    	lfmtext += row.name + " searched " + elapsedH + " hours and "+ elapsedM+ " minutes ago\n"
    	console.log(lfmtext)
    });
     
     return(lfmtext) 
        })
        .then(function(articles) {
		msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : "Other players searching for " + filter,
  					value : "a: "+articles+ "--"+lfmtext
  				}],
			})	 
        })
        .catch(function(e) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "There was a connection error, please try again later.",
            });
            console.log(e)
        })



Promise.resolve()
  // Update db schema to the latest version using SQL-based migrations
  .then(
  	lfmtext = processEachTask(db, filter, timepoint,lfmtext)
  )                  // <=
  // Display error message if something went wrong
  .catch((err) => console.error(err.stack))
  // Finally, launch the Node.js app
  .finally(
     msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : "Other players searching for " + filter,
  					value : "a: "+lfmtext
  				}],
	})	  
  );

// var asyncOps = [
//     function (done) {
// db.each("SELECT name, searching, time FROM lfg WHERE searching IS '"+filter+"' ORDER BY time", function(err, row) {
// 	var elapsed = 	timepoint - row.time;
//     let diff = Math.floor(elapsed / 86400) + 1;
//     var elapsedH = Math.floor((elapsed % 86400) / 3600);
//     var elapsedM = Math.floor(((elapsed % 86400) / 60) % 60);
//     
//     lfmtext += row.name + " searched " + elapsedH + " hours and "+ elapsedM+ " minutes ago\n"
//         });
// 
// 	},
//     function (done) {
//     msg.channel.sendEmbed({
//   				color: 0x800000,
//   				fields: [{
//   					name : "Other players searching for " + filter,
//   					value : "a: "+lfmtext
//   				}],
// 	});	
//     }
// ];
// 
// async.series(asyncOps, function (err, results) {
//     if (err) return console.log(err);
//     // results = [ row1, row2 ];
// });

/* 
db.each("SELECT name, searching, time FROM lfg WHERE searching IS '"+filter+"' ORDER BY time", function(err, row) {
	var elapsed = 	timepoint - row.time;
    let diff = Math.floor(elapsed / 86400) + 1;
    var elapsedH = Math.floor((elapsed % 86400) / 3600);
    var elapsedM = Math.floor(((elapsed % 86400) / 60) % 60);
    
    lfmtext += row.name + " searched " + elapsedH + " hours and "+ elapsedM+ " minutes ago\n"

  //  console.log(row.name + " searched " + elapsedH + " hours and "+ elapsedM+ " minutes ago: " + row.searching);



});
    msg.channel.sendEmbed({
  				color: 0x800000,
  				fields: [{
  					name : "Other players searching for " + filter,
  					value : lfmtext
  				}],
	});	
 */

};

//create table lfg (name varchar(20), searching varchar(20), time varchar(20));
//insert into lfg values ("@dummy",10);
