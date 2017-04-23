const nh = require("../data/name_helper.js")

module.exports = (bot, msg, setitems) => {

        var results = [];
        var searchField = "Name";
        var filter = new RegExp(msg.content.split(" ").slice(1).join(" "), "i")
    
        for (var i = 0; i < setitems.length; i++) {
            if (setitems[i][searchField].match(filter)) {
                results.push(setitems[i]);
            }
        }
		var setTextTitle = "Found " + results.length + " sets matching your request."; 
	//	msg.channel.sendMessage("Found " + results.length + " sets matching your request.");

        msg.channel.sendEmbed({
  			color: 0x800000,
  			description: setTextTitle,
		});		
		
		if (results.length < 6 && results.length > 0){
        var outputsets = [];
            
        for (var i = 0; i < results.length; i++) {
        
			var location = JSON.stringify(results[i].Location)
			location = nh.linkify(JSON.stringify(results[i].Location))

            outputsets[JSON.stringify(results[i].Name)] =  JSON.stringify(results[i].Pieces) + "," + " obtainable from ";
            outputsets[JSON.stringify(results[i].Name)] += location + " (" + JSON.stringify(results[i].Type) + ")\n";
            if (results[i].i1 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(1 pc)** " + JSON.stringify(results[i].i1) + "\n"
            };
            if (results[i].i2 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(2 pc)** " + JSON.stringify(results[i].i2) + "\n"
            };
            if (results[i].i3 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(3 pc)** " + JSON.stringify(results[i].i3) + "\n"
            };
            if (results[i].i4 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(4 pc)** " + JSON.stringify(results[i].i4) + "\n"
            };
            if (results[i].i5 != "") {
                outputsets[JSON.stringify(results[i].Name)] += "**(5 pc)** " + JSON.stringify(results[i].i5) + "\n"
            };

        msg.channel.sendEmbed({
  			color: 0x800000,
  		//	description: helpinfo,
  			fields: [{
       			 name: Object.keys(outputsets)[i].replace(/\"/g, ""),
       			 value: outputsets[Object.keys(outputsets)[i]].replace(/\"/g, "")
     		 }
    		]
		});

         //   var outputsetsesc = outputsets.replace(/\"/g, "");

         //   msg.channel.sendMessage(outputsetsesc);

        }		
		}else if(results.length == 0){
	//		msg.channel.sendMessage("Please avoid metacharacters like hyphens or apostrophes. Tip: you can search for incomplete names as well e.g.\n**!set skel**\nwill prompt also sets matching Skeleton.");
        msg.channel.sendEmbed({
  			color: 0x800000,
  			description: "Please avoid metacharacters like apostrophes. \nTip: you can search for incomplete names as well e.g.\n**!set skel**\nwill prompt also sets matching 'Skeleton'.",
		});		
		}else{
	//		msg.channel.sendMessage("Please narrow down your request to avoid spam by providing more characters.");
        msg.channel.sendEmbed({
  			color: 0x800000,
  			description: "Please narrow down your request to avoid spam by providing more characters.",
		});		
		}
		
// 		
//         msg.channel.sendEmbed({
//   			color: 0x800000,
//   		//	description: helpinfo,
//   			fields: [{
//        			 name: Object.keys(outputsets)[0].replace(/\"/g, ""),
//        			 value: outputsets[Object.keys(outputsets)[0]].replace(/\"/g, "")
//      		 },
//      		 {
//        			 name: Object.keys(outputsets)[1].replace(/\"/g, ""),
//        			 value: outputsets[Object.keys(outputsets)[1]].replace(/\"/g, "")
// 			},
//      		 {
//        			 name: Object.keys(outputsets)[2],
//        			 value: outputsets[Object.keys(outputsets)[2]]
// 			}
//     		]
// 		});

};