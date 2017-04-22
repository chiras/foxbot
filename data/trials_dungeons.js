const baseurluesp = "http://en.uesp.net/wiki/"

const shortnames = {
    "AA": "Aetherian Archive",
    "HRC": "Hel Ra Citadel",
    "SO": "Sanctum Ophidia",
    "MOL": "Maw of Lorkhaj",
    "DSA": "Dragonstar Arena (Veteran)",
    "MSA": "Maelstrom Arena (Veteran)",
};

const wikilinks = {
		// Zones
		"Stonefalls" : "Online:Stonefalls",
		
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


exports.getLongName = function (shortname) {
	return shortnames[shortname.replace(/\"/g, "")]
}

exports.getValidTrials = function (shortname) {
	if (shortnames[shortname]){return true}
}

exports.getTrialShortnames = function () {
	return Object.keys(shortnames);
}

exports.linkify = function (input) {
	var allnames = input.replace(/\"/g, "").split("/")
	var output = [];
	
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
