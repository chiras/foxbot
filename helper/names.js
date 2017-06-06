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
var traits = {
	"powered" : 0,
	"charged" : 1,
	"precise" : 2,
	"infused" : 3,
	"defending" : 4,
	"training" : 5,
	"sharpened" : 6,
	"decisive" : 7
}

const instances = {
    "aa": "Aetherian Archive",
    "hrc": "Hel Ra Citadel",
    "so": "Sanctum Ophidia",
    "mol": "Maw of Lorkhaj",
    "hof": "Halls of Fabrication",
    "dsa": "Dragonstar Arena",	// needs " (Veteran)" for leaderboards
    "msa": "Maelstrom Arena"	// needs " (Veteran)" for leaderboards
  //  "bg": "Battlegrounds",
};


var instanceGroup = { 	"all" : ["aa", "hrc", "so", "mol", "hof", "dsa", "msa"],
						"solo" : ["msa"],
						"trials" : ["aa", "hrc", "so", "mol", "hof"],
			//			"pvp" : [],
			//			"bg" : [],
						"pve" : ["aa", "hrc", "so", "mol", "hof", "dsa", "msa"],
						"group" : ["aa", "hrc", "so", "mol", "hof", "dsa"]	,

						"instanceGrpOptions" : ["all","solo","group","trials","pve"]
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
	var cp = new RegExp("cp","i")
	var lvl = new RegExp("lvl","i")
	var number = new RegExp("[0-9]+","i")
	var result = 0;
	console.log("level"+type)
	
	if (type.match(cp)){
		result = Number(type.match(number)[0])+50;
	}else if(type.match(lvl)){
		result = Number(type.match(number)[0]);	
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

exports.getValidInstances = function (shortname) {
//	console.log(">>>"+shortname+"<<<")
	if (instances[shortname.replace(/ /g, "")]){return true
	}else{
		if (instanceGroup[shortname.replace(/ /g, "")]){return true
		}else{
			return false;	
	}}
		
}


exports.getInstances = function (instance) {
	var arrayoOfInstances= [];
	var shortnames = [];
		
	if (typeof instance !== "undefined" | instance != ""){
		
		if (Object.keys(instanceGroup).includes(instance)){
			arrayoOfInstances = instanceGroup[instance]
		}else{
			arrayoOfInstances = [instance]
		}
		for (var i = 0; i < arrayoOfInstances.length; i ++){
			shortnames.push(arrayoOfInstances[i])
		}
		
	}else{
		shortnames = Object.keys(instances)
	}

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

		if (name.length < 4){name = shortnames[name]}
		if (wikilinks[name]){
			output.push("["+name+"]("+ baseurluesp + wikilinks[name]+")")
		}else if (wikilinks[name + " I"]){
			output.push("["+name+" I]("+ baseurluesp + wikilinks[name + " I"]+") and [II]("+ baseurluesp + wikilinks[name + " II"]+")")
		}else{
			output.push(name);
		}		
	}
	
	return output.join(", ");
}

