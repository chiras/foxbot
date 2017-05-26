const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const moment = require('moment-timezone');
const fs = require('fs');

const nh = require("../data/name_helper.js")

const resetTime = '2:00am';
const resetZone = 'America/New_York';
const baseTimestamp = 1475301600;
const baseDoW = 6 //2016-02-01 is Monday (0 - Sun, 1 - Mon, 2 - Tue, 3 - Wed, 4 - Thu, 5 - Fri, 6 - Sat)
const Maj = 0;
const Glirion = 1;
const Urgalag = 2;

var basePledgeURL = "https://www.esoleaderboards.com/api/api.php?callType=getPledge&pledgeType="
var dayURL = "&daysFromNow=1"

var questgiver = {
    "Maj al-Ragath": 1,
    "Glirion the Redbeard": 2,
    "Urgarlag Chief-Bane": 3
};
var pledgeAPI = [basePledgeURL + questgiver["Maj al-Ragath"],
    basePledgeURL + questgiver["Glirion the Redbeard"],
    basePledgeURL + questgiver["Urgarlag Chief-Bane"],
    basePledgeURL + questgiver["Maj al-Ragath"] + dayURL,
    basePledgeURL + questgiver["Glirion the Redbeard"] + dayURL,
    basePledgeURL + questgiver["Urgarlag Chief-Bane"] + dayURL
];


function processFeed(feed) {
    // use the promisified version of 'get'
    return request.getAsync(feed)
}

function updatePledges(callback) {
    var pledgeText = "";
    var pledgeTextNext = "";
    var promise = Promise.resolve(3);

Promise.map(pledgeAPI, function(feed) {
            return processFeed(feed)
        })
        .then(function(articles) {
            for (var i = 0; i < 3; i++) {
                pledgeText += "* " + nh.linkify(articles[i].body) + " (by " + Object.keys(questgiver)[i] + ")\n"; 

            }


            for (var i = 0; i < 3; i++) {
                pledgeTextNext += nh.linkify(articles[i + 3].body) + ", ";

            }

            pledgeTextNext = pledgeTextNext.slice(0, -2);
            //pledgeTextNext += " in " + remainingH + " hours and " + remainingM + " minutes.";

            callback(pledgeText, pledgeTextNext);

        })
        .catch(function(e) {
            console.log(e)
        })

}

file = "./data/events.json"
// 
// function saveFile(data) {
//     fs.writeFileSync(file, JSON.stringify(data));
// }


exports.pledges = function(callback) {

let todaysPledges = {"updated":"", "pledgeTxt" :"", "pledgeTxtNext" : ""}

if (fs.existsSync(file))
//    todaysPledges = JSON.parse(fs.readFileSync(file, 'utf8'));

    // this time calculation has been taken from Seri's code
    var elapsed = moment().unix() - baseTimestamp;

    let diff = Math.floor(elapsed / 86400) + 1;
    let diff_updated = Math.floor(elapsed / 86400) + 1;

    var remainingH = 23 - Math.floor((elapsed % 86400) / 3600);
    var remainingM = 59 - Math.floor(((elapsed % 86400) / 60) % 60);
	console.log(elapsed)
    
    // caching, but not implemented atm
//     if (todaysPledges["updated"] == "" || elapsed < (60 * 60)){
//     	console.log("NEW")
    	todaysPledges["updated"] = moment().unix();
    	updatePledges(function(pledgeText, pledgeTextNext){
      		todaysPledges["pledgeTxt"] = pledgeText;
      		todaysPledges["pledgeTxtNext"] = pledgeTextNext;
 //		 	saveFile(todaysPledges);  			      		
			callback(todaysPledges.pledgeTxt,todaysPledges.pledgeTxtNext + " in " + remainingH + " hours and " + remainingM + " minutes." )
    	})
    	
    
//     }else{
//      	console.log("OLD")
//   		let diffupdate = moment().unix() - todaysPledges.updated;   
//     }
};





