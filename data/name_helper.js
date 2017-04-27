const baseurluesp = "http://en.uesp.net/wiki/"

const servers = { 	"eu" : "EU" ,
					"na" : "NA", 
					"pts" : "PTS",
					"EU" : "EU" ,
					"NA" : "NA", 
					"PTS" : "PTS"}

const factions = [	{	
					"shortname" : "EP",
					"longname" : "Ebonheart Pact",
					"url" : "",
					"loc" : "Loc_EP",
					"locDet" : "LocDet_EP"
					},
					{
					"shortname" : "DC",
					"longname" : "Daggerfall Covenant",
					"url" : "",
					"loc" : "Loc_DC",
					"locDet" : "LocDet_DC"
					},
					{	
					"shortname" : "AD",
					"longname" : "Aldmeri Dominion",
					"url" : "",
					"loc" : "Loc_AD",
					"locDet" : "LocDet_AD"
					},
					];
					

const shortnames = {
    "AA": "Aetherian Archive",
    "HRC": "Hel Ra Citadel",
    "SO": "Sanctum Ophidia",
    "MOL": "Maw of Lorkhaj",
    "DSA": "Dragonstar Arena (Veteran)",
    "MSA": "Maelstrom Arena (Veteran)",
	"EP" : "EP",
	"DC" : "DC",				
	"AD" : "AD"	
};


const trailnames = {
    "AA": "Aetherian Archive",
    "HRC": "Hel Ra Citadel",
    "SO": "Sanctum Ophidia",
    "MOL": "Maw of Lorkhaj",
    "DSA": "Dragonstar Arena (Veteran)",
    "MSA": "Maelstrom Arena (Veteran)"
};

const wikilinks = {
		// Factions
		"EP" : "Online:Ebonheart_Pact",
		"DC" : "Online:Daggerfall_Covenant",				
		"AD" : "Online:Aldmeri_Dominion",	

	// Places
//	"Chill House" : "Online:Chill_House",
				
		// Zones
		"Stonefalls" : "Online:Stonefalls",
		"Auridon" : "Online:Auridon",
		"Glenumbra" : "Online:Glenumbra",

	
	// Trials
    "Aetherian Archive": "Online:Aetherian_Archive",
    "Hel Ra Citadel": "Online:Hel_Ra_Citadel",
    "Sanctum Ophidia": "Online:Sanctum_Ophidia",
    "Maw of Lorkhaj": "Online:Maw_of_Lorkhaj",
    "Dragonstar Arena (Veteran)": "Online:Dragonstar_Arena",
    "Maelstrom Arena (Veteran)": "Online:Maelstrom_Arena",
    
		// Dungeons
		"The Banished Cells I" : "Online:The_Banished_Cells_I",
		"The Banished Cells II" : "Online:The_Banished_Cells_II",
		"Elden Hollow I" : "Online:Elden_Hollow_I",
		"Elden Hollow II" : "Online:Elden_Hollow_II",
		"City of Ash I" : "Online:City_of_Ash_I",
		"City of Ash II" : "Online:City_of_Ash_II",
		"Tempest Island" : "Online:Tempest_Island",
		"Selene's Web" : "Online:Selene%27s_Web",
		"Volenfell" : "Online:Volenfell",
		"Blackheart Haven" : "Online:Blackheart_Haven",
		"Spindleclutch I" : "Online:Spindleclutch_I",
		"Spindleclutch II" : "Online:Spindleclutch_II",
		"Crypt of Hearts I" : "Online:Crypt_of_Hearts_I",
		"Crypt of Hearts II" : "Online:Crypt_of_Hearts_II",
		"Wayrest Sewers I" : "Online:Wayrest_Sewers_I",
		"Wayrest Sewers II" : "Online:Wayrest_Sewers_II",
		"Darkshade Caverns I" : "Online:Darkshade_Caverns_I",
		"Darkshade Caverns II" : "Online:Darkshade_Caverns_II",
		"Direfrost Keep" : "Online:Direfrost_Keep",
		"Blessed Crucible" : "Online:Blessed_Crucible",
		"Arx Corinium" : "Online:Arx_Corinium",
		"Cradle of Shadows" : "Online:Cradle_of_Shadows",
		"Ruins of Mazzatun" : "Online:Ruins_of_Mazzatun",
		"Fungal Grotto I" : "Online:Fungal_Grotto_I",
		"Fungal Grotto II" : "Online:Fungal_Grotto_II",
		"Vaults of Madness" : "Online:Vaults_of_Madness",
		"White-Gold Tower" : "Online:White-Gold_Tower",
		"Imperial City Prison" : "Online:Imperial_City_Prison"
};

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
	if (type.replace(/\"/g, "").replace(/ /g, "").toLowerCase().startsWith("cp") | type.replace(/\"/g, "").replace(/ /g, "").toLowerCase().startsWith("lvl")) {
		return type.replace(/\"/g, "").replace(/ /g, "").toLowerCase();
	} 
}

exports.getRole = function (type) {
	return roles[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]
}

exports.getServer = function (type) {
	return servers[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]
}

exports.getGroupMode = function (type) {
	return groupmode[type.replace(/\"/g, "").replace(/ /g, "").toLowerCase()]
}

exports.getLongName = function (shortname) {
	return shortnames[shortname.replace(/\"/g, "")]
}

exports.getValidTrials = function (shortname) {
	if (shortnames[shortname.replace(/ /g, "")]){return true}
}

exports.getValidServer = function (server) {
	//console.log(server, servers)
	if (servers[server.replace(/ /g, "")]){return true}
}

exports.getTrialShortnames = function () {
	return Object.keys(trailnames);
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
