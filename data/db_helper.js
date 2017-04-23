exports.getTimeDiff = function(timepoint, oldtime, concise){
        var elapsed = 	timepoint - oldtime;
   		let diff = Math.floor(elapsed / 86400) + 1;
    	var elapsedH = Math.floor((elapsed % 86400) / 3600);
    	var elapsedM = Math.floor(((elapsed % 86400) / 60) % 60);
    	
    	if (concise != "short"){
    		return elapsedH + " hours and "+ elapsedM+ " minutes ago";  	
    	}else{
   			return elapsedH + "h "+ elapsedM+ "min ago";
    	}
}

exports.getDbRecords = function(db, args, callback) {
    db.all("SELECT * FROM lfg WHERE searching IS '"+args["searching"]+"'AND megaserver IS '"+args["megaserver"]+"'AND vetnormal IS '"+args["vetnormal"]+"' ORDER BY time", function(err, all) {
        if (err){console.log(err)};
        callback(err, all, args);  
    });
}; 

exports.getDbInserts = function(db, args, callback) {
	db.each("INSERT into lfg(name, guild, megaserver, lvlcp, role, searching, vetnormal, time, type) VALUES ('"+args["name"]+"', '"+args["guild"]+"', '"+args["megaserver"]+"', '"+args["lvlcp"]+"', '"+args["role"]+"', '" + args["searching"] + "', '"+args["vetnormal"]+"', '"+args["timepoint"]+"', '"+args["type"]+"')", function(err, row) {
		if (err){
			console.log(err)
		}else{

		}	
	});
}; 


