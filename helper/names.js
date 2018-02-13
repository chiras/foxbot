const baseurluesp = "http://en.uesp.net/wiki/"

const servers = { 	"eu" : "EU" ,
					"na" : "NA", 
					"pts" : "PTS",
					"na-xbox" : "XBOX - NA" ,
					"eu-xbox" : "XBOX - EU", 
					"na-ps4" : "PS4 - NA" ,
					"eu-ps4" : "PS4 - EU"}

var quality = {
	"white" : 0,
	"normal" : 0,
	"green" : 1,
	"fine" : 1,
	"blue" : 2,
	"superior" : 2,
	"purple" : 3,
	"epic" : 3,
	"orange" : 4,
	"gold" : 4,
	"yellow" : 4,
	"legendary" : 4
}
// var traits = {
// 	"powered" : 0,
// 	"charged" : 1,
// 	"precise" : 2,
// 	"infused" : 3,
// 	"defending" : 4,
// 	"training" : 5,
// 	"sharpened" : 6,
// 	"decisive" : 7
// }

var traits = {
	"powered" : 0,
	"charged" : 1,
	"precise" : 2,
	"infused" : 3,
	"defending" : 4,
	"training" : 5,
	"sharpened" : 6,
	"decisive" : 7,
	"sturdy" : 8,
	"impenetrable" : 9,
	"reinforced" : 10,
	"well-fitted" : 11,
	"prosperous" : 12,
	"divines" : 13,
	"nirnhoned" : 14,
	"intricate" : 15,
	"ornate" : 16,
	"arcane" : 17,	
	"healthy" : 18,	
	"robust" : 19,	
}

const instances = {
    "aa": "Aetherian Archive",
    "hrc": "Hel Ra Citadel",
    "so": "Sanctum Ophidia",
    "mol": "Maw of Lorkhaj",
    "hof": "Halls of Fabrication",
    "dsa": "Dragonstar Arena",	// needs " (Veteran)" for leaderboards
    "msa": "Maelstrom Arena",	// needs " (Veteran)" for leaderboards
	"weekly": "Weekly Trial",
	"weeklymsa": "Weekly Maelstrom Arena",
  //  "bg": "Battlegrounds",

	"fg2" 	: 'Fungal Grotto II',
	"sc1" 	: 'Spindleclutch I',
	"dc2" 	: 'Darkshade Caverns II',
	"eh1" 	: 'Elden Hollow I',
	"ws2" 	: 'Wayrest Sewers II',
	"fg1" 	: 'Fungal Grotto I',
	"bc2" 	: 'Banished Cells II',
	"dc1"	: 'Darkshade Cavern I',
	"eh2"	: 'Elden Hollow II',
	"ws1"	: 'Wayrest Sewers I',
	"sc2"	: 'Spindleclutch II',
	"bc1"	: 'Banished Cells I',
	
	"coh2"	: 'Crypt of Hearts II',
	"coa1"	: 'City of Ash I',
	"ti"	: 'Tempest Island',
	"bh"	: 'Blackheart Haven',
	"arx"	: 'Arx Corinium',
	"sw"	: "Selene's Web",
	"coa2"	: 'City of Ash II',
	"coh1"	: 'Crypt of Hearts I',
	"vol"	: 'Volenfell',
	"bc"	: 'Blessed Crucible',
	"dire"	: 'Direfrost Keep',
	"vom"	: 'Vaults of Madness',
	
	"fh"	: 'Falkreath Hold',
	"bf"	: 'Bloodroot Forge',
	"cos"	: 'Cradle of Shadows',
	"icp"	: 'Imperial City Prison',
	"rom"	: 'Ruins of Mazzatun',
	"wgt"	: 'White-Gold Tower',
	"fl" 	: 'Fang Liar',
	"sp"	: 'Scalecaller Peak'
};

var instancesGroup = { 	"lbAll" : ["aa", "hrc", "so", "mol", "hof", "dsa", "msa"],
						"solo" : ["msa"],
						"trials" : ["aa", "hrc", "so", "mol", "hof"],
						"weekly" : ["weekly", "weeklymsa"],
			//			"pvp" : [],
			//			"bg" : [],
						"pve" : ["aa", "hrc", "so", "mol", "hof", "dsa", "msa"],
						"group" : ["aa", "hrc", "so", "mol", "hof", "dsa"]	,
						"dungeon" : ["fg2" ,"sc1" ,"dc2" ,"eh1" ,"ws2" ,"fg1" ,"bc2" ,"dc1","eh2","ws1","sc2","bc1","coh2","coa1","ti","bh","arx","sw","coa2","coh","vol","bc","dire","vom","cos","icp","rom","wgt"]	,

						"lbOptions" : ["all","solo","group","trials","pve","weekly"]
					}

const groupmode = {
		"vet" : "veteran",
		"v" : "veteran",
		"veteran" : "veteran",
		"norm" : "normal",
		"n" : "normal",
		"normal" : "normal",
		"hm" : "hard-mode",
		"hardmode" : "hard-mode",
		"Hardmode" : "hard-mode",
		"hard-mode" : "hard-mode",
		"small scale" : "smallscale", 
		"smallscale" : "smaallscale",
		"big group" : "pug",
		"pug" : "pug",
		"battleground" : "battleground"
}

const roles = {
		"heal" : "Heal",
		"hps" : "Heal",
		"healer" : "Heal",
		"h" : "Heal",
		"dd" : "DD",
		"damage dealer" : "DD",
		"damage" : "DD",
		"dps" : "DD",
		"d" : "DD",
		"tank" : "Tank",
		"t" : "Tank",
}

exports.getCpLvl = function (type) {
	var result = 0;

	if (type != "lvl" && type != "cp" && !type.match(/-/)){
	var cp = new RegExp("cp","i")
	var lvl = new RegExp("lvl","i")
	var number = new RegExp("[0-9]+","i")
		
	if (Number(type.match(number))){
	if (type.match(cp)){
		result = Number(type.match(number)[0])+50;
		if (result > 210) result = 210
	}else if(type.match(lvl)){
		result = Number(type.match(number)[0]);	
		if (result < 1) result = 1;
	}}
	
	}
	return (result);
}

exports.getServer = function (type) {
	if (servers[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]){ 
		return servers[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()];
	}else{
		return false;
	}
}

exports.listServers = function (){
	return servers;
}

exports.getQuality = function (type) {
	if (typeof quality[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]!=="undefined"){
		return quality[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()].toString();
	}else{
		return false;
	}
}

exports.getTrait = function (type) {
	if (typeof traits[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]!=="undefined"){ 
		return traits[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()].toString();
	}else{
		return false;
	}
}


exports.decodeLevel = function(lvl){
	if (lvl > 50){
		var l = lvl - 50;
		return "cp"+ l ;
		}else{
		return "lvl"+ lvl ;
		
		}
	}


// exports.getInstance = function (type) {
// 	if (instances[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]){ 
// 		return instances[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()];
// 	}else{
// 		return false;
// 	}
// }


//// old functions
exports.getRole = function (type) {
	return roles[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]
}

exports.getGroupMode = function (type) {
	return groupmode[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]
}

exports.getLongName = function (shortname) {
	return instances[shortname.replace(/\"/g, "")]
}

exports.getValidInstances = function (name) {
	var shortname = name.trim();
	if (instances[shortname]){return shortname;
	}else{
		if (instancesGroup[shortname]){return shortname;
		}else{
			var longname = false;
			for (var i = 0; i < Object.keys(instances).length;i++){
				if (instances[Object.keys(instances)[i]] == shortname) {
					longname = Object.keys(instances)[i]
					//console.log(longname+"/"+shortname)
					};
			}
			return longname;	
	}}
		
}


exports.getInstances = function (instance) {
	var arrayoOfInstances= [];
	var shortnames = [];
		
	if (typeof instance !== "undefined" | instance != ""){
		
		if (Object.keys(instancesGroup).includes(instance)){
			arrayoOfInstances = instancesGroup[instance]
		}else{
			arrayoOfInstances = [instance]
		}
		for (var i = 0; i < arrayoOfInstances.length; i ++){
			shortnames.push(arrayoOfInstances[i])
		}
		
	}// else{
// 		shortnames = Object.keys(instances)
// 	}

	if (shortnames.length > 0){
		return shortnames;
	}
}

exports.linkify = function (input) {
	var allnames = input.replace(/\"/g, "").split("/")
	var output = [];
//	console.log(allnames)
	
	for (var i = 0; i < allnames.length; i++){
		var name = allnames[i].replace(/\"/g, "");

//		if (name.length < 4){name = shortnames[name]}
		output.push("["+name+"]("+ baseurluesp + "Online:"+name.replace(/ /g, "_")+")")
		
// 		if (wikilinks[name]){
// 			output.push("["+name+"]("+ baseurluesp + wikilinks[name]+")")
// 		}else if (wikilinks[name + " I"]){
// 			output.push("["+name+" I]("+ baseurluesp + wikilinks[name + " I"]+") and [II]("+ baseurluesp + wikilinks[name + " II"]+")")
// 		}else{
// 			output.push(name);
// 		}		
	}
	
	return output.join(", ");
}

