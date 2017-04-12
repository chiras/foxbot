module.exports = (bot, msg, setitems) => {

        var results = [];
        var searchField = "Name";
        var filter = new RegExp(msg.content.split(" ").slice(1).join(" "), "i")

        for (var i = 0; i < setitems.length; i++) {
            if (setitems[i][searchField].match(filter)) {
                results.push(setitems[i]);
            }
        }

		msg.channel.sendMessage("Found " + results.length + " sets matching your request.");
		
		if (results.length < 6){
        for (var i = 0; i < results.length; i++) {

            var outputsets = "";

            outputsets += "**" + JSON.stringify(results[i].Name) + "** (" + JSON.stringify(results[i].Pieces) + ")" + " obtainable from ";
            outputsets += JSON.stringify(results[i].Location) + " (" + JSON.stringify(results[i].Type) + ")\n";
            if (results[i].i1 != "") {
                outputsets += "(1 pc) " + JSON.stringify(results[i].i1) + "\n"
            };
            if (results[i].i2 != "") {
                outputsets += "(2 pc) " + JSON.stringify(results[i].i2) + "\n"
            };
            if (results[i].i3 != "") {
                outputsets += "(3 pc) " + JSON.stringify(results[i].i3) + "\n"
            };
            if (results[i].i4 != "") {
                outputsets += "(4 pc) " + JSON.stringify(results[i].i4) + "\n"
            };
            if (results[i].i5 != "") {
                outputsets += "(5 pc) " + JSON.stringify(results[i].i5) + "\n"
            };

            var outputsetsesc = outputsets.replace(/\"/g, "");

            msg.channel.sendMessage(outputsetsesc);

        }		
		}else{
			msg.channel.sendMessage("Please narrow down your request to avoid spam by providing more characters.");
		}

};