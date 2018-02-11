const moment = require('moment-timezone');

const nh = require("../helper/names.js")

const resetTime = '2:00am';
const resetZone = 'America/New_York';
const baseTimestamp = 1475301600;
const baseDoW = 6 //2016-02-01 is Monday (0 - Sun, 1 - Mon, 2 - Tue, 3 - Wed, 4 - Thu, 5 - Fri, 6 - Sat)
const Maj = 0;
const Glirion = 1;
const Urgalag = 2;


var questgiver = ["Maj al-Ragath", "Glirion the Redbeard", "Urgarlag Chief-Bane"]

const rotation = [	['Fungal Grotto II', 'Spindleclutch I', 'Darkshade Caverns II', 'Elden Hollow I', 'Wayrest Sewers II', 'Fungal Grotto I', 'Banished Cells II', 'Darkshade Cavern I', 'Elden Hollow II', 'Wayrest Sewers I','Spindleclutch II', 'Banished Cells I'],
    				['Crypt of Hearts II', 'City of Ash I', 'Tempest Island', 'Blackheart Haven', 'Arx Corinium', "Selene's Web",'City of Ash II', 'Crypt of Hearts I', 'Volenfell', 'Blessed Crucible', 'Direfrost Keep', 'Vaults of Madness'],
    				[ 'Falkreath Hold','Fang Liar','Scalecaller Peak','Imperial City Prison','Ruins of Mazzatun', 'White-Gold Tower', 'Cradle of Shadows','Bloodroot Forge']];


function getDungeon(npc, idx) {
    if (!rotation[npc])
        return;
    return rotation[npc][idx % rotation[npc].length];
}

exports.pledges = function(time, callback) {

    // this time calculation has been taken from Seri's code

    var elapsed = time - baseTimestamp;
    let diff_rot = Math.floor(elapsed / 86400);
    
    pledgeText = [];
    pledgeNext = [];
    for (var i = 0; i < questgiver.length;i++){
        pledgeText.push("* " + nh.linkify(getDungeon(i, diff_rot)) + " (by " + questgiver[i] + ")"); 
        pledgeNext.push(nh.linkify(getDungeon(i, diff_rot + 1)));
    }
        
    var remainingH = 23 - Math.floor((elapsed % 86400) / 3600);
    var remainingM = 59 - Math.floor(((elapsed % 86400) / 60) % 60);
    
	callback(pledgeText.join("\n"),pledgeNext.join(", ") + " in " + remainingH + " hours and " + remainingM + " minutes." )
    	
};

exports.dungeon = function(input, callback) {
	
	var shortname = nh.getValidInstances(input)

	if (shortname){
	var query = nh.getLongName(shortname)
	
    var elapsed = moment().unix() - baseTimestamp;
    let diff_rot = Math.floor(elapsed / 86400);
    
	var remaining = "";	
    for (var i = 0; i < rotation.length;i++){
    	if (rotation[i].includes(query)){
    		var index = rotation[i].indexOf(query)
    		var today = rotation[i].indexOf(getDungeon(i, diff_rot))
			var diffp;
			if (today > index){
				diffp = rotation[i].length + index - today
			}else if(today < index){
				diffp = index - today			
			}
			
    		remaining += ""+nh.linkify(rotation[i][index]) + " will be a pledge in **" + diffp + " days**."
			
			if (today == index){
				remaining = ""+nh.linkify(rotation[i][index]) + " is pledge today!"
			}
			
    	}	
    }
    if (remaining == ""){
		remaining = "I was not able to identify your requested dungeon."        
    }
    }else{
		remaining = "I was not able to identify your requested dungeon."    
    }    
	callback(remaining)	
};





