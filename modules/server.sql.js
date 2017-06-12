const mh = require("../helper/messages.js")
const dh = require("../helper/db.js")


module.exports = (bot, msg, options, mysql, Discord) => {

var embed = mh.prepare(Discord);

if (options.options[0] == "-help"){

    embed.setTitle("Options for " + options.command)
    embed.setDescription("It is possible to combine the options below. Launcher messages and Forum announcements may not always be available.")
    embed.addField(options.command, "Shows status of all servers, launcher and forum announcements")
    embed.addField(options.command + " na, eu, pts", "only for specific servers")
    embed.addField(options.command + " -short", "only server status")
    embed.addField(options.command + " -forum", "only server status and forum announcements")
    embed.addField(options.command + " -launcher", "only server status and launcher messages")
    
    mh.send(msg, embed, options)

}else{
	var wheretxt = "";
	if (options.megaservers.length > 0){
		wheretxt = "WHERE id LIKE '"+options.megaservers.join("' OR id LIKE '")+"'  OR id LIKE '_launcher'  OR id LIKE '_forums';"
	}
    var query = 'SELECT * FROM servers ' + wheretxt;
    dh.mysqlQuery(mysql, query, function(error, results) {
        
        var statustxt = ""
        for (var i = 0; i < results.length;i++){
        	if (!results[i].id.startsWith("_")){
	        	statustxt += results[i].id + ": "+ results[i].status +"\n";
        	}
        }
    	if ((options.options.length == 0 || options.options.includes("-forum")) && !options.options.includes("-short")){
    		if (results[results.length-2].status != ""){
    			embed.addField("Forum announcements:",results[results.length-2].status)
    		}
    	}
    	if ((options.options.length == 0 || options.options.includes("-launcher")) && !options.options.includes("-short")){
    		if (results[results.length-1].status != ""){
     			embed.addField("Launcher messages:",results[results.length-1].status)
     		}
	    }



        embed.addField("Server status:", statustxt)
        
        embed.addField("Configure auto-notifications of server status changes:", "**!config**")
        mh.send(msg, embed, options)

    })

}
};