const nh = require("../helper/names.js")
const fh = require("../helper/functions.js")
/**
Argument Types:

!command
-option
NA/EU/PTS/NA-XBOX/EU-XBOX/NA-PS4/EU-PS4
$/@account
$poll
question?
answer.
1,2,... votes
blablup sets

qualities
levels/cp
traits

!command $account, NA, -op1 -op2 ballal 1,2  superior, 
**/

function definePollQuestion(input,callback){
		pollObject = {
			"options" : [],
			"question": [],
			"answers" : [],
			"slice_info"	: []
		}
		var anonymous = new RegExp("-anonym","i")
		
		if (input.match(anonymous)){
			pollObject["options"].push("-anonym")
			input = input.replace(anonymous,"")
		}
		
		var qargs = input.split("?");
   		
        var question = qargs[0].trim();
        if (question.length>200){
        	question = question.substr(0,200).trim() + "...?"
        	pollObject["slice_info"].push("Question has been shortened to avoid Discord issues (max 200 characters)")
        }else{
         	question = question + "?"       
        }
		
		pollObject["question"].push(question)
        
        var answers = qargs.slice(1).join("").split(".")

     	answers = answers.filter(function (item) {
			   return item.trim().indexOf("-anonym") !== 0;
		});	

     	answers = answers.filter(function (item) {
			   return item.trim() != '';
		});	
		
		var answers_trimmed = answers.map(string => {
  			return string.trim()
		})
		
		pollObject["answers"] = answers_trimmed
		callback(pollObject)
}

exports.argumentSlicer = function(msg, mysql, callback){ // add required / optional?
	var args = msg.content;

	var returnObj = {
		"user" 			: msg.author.id,
		"channel" 		: msg.channel.id,
		"guild" 		: "DM",
		"command" 		: [],
		"options" 		: [],
		"question"		: [],
		"answers"		: [],
		"megaservers" 	: [],
		"accounts" 		: [],
		"level" 		: [],
		"instance" 		: [],
		"item_quality" 	: [],
		"item_trait" 	: [],
		"value_num" 	: [],
		"value_char"	: [],
		"date"			: [],
		"range"		: [],
		"others"		: [],
		"slice_info"	: []
	}
	
	if (msg.guild){
		returnObj["guild"] = msg.guild.id
	}
	var command = new RegExp("\![a-zA-Z]+","i")
	var isDate = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}', 'i');	
	returnObj["command"].push(args.match(command)[0].trim())
	
	args = args.replace(command,"").trim();
	
	if (args != ""){
		if (args.includes("?") & (returnObj["command"] == "!poll" || returnObj["command"] == "!vote")){
		// console.log("got a question here")
		
			definePollQuestion(args,function(pollOutput){
				returnObj["question"] = pollOutput.question			
				returnObj["answers"] = pollOutput.answers
				returnObj["options"] = pollOutput.options			
				returnObj["slice_info"] = pollOutput.slice_info			
			})
		
		}
		// console.log("got no question here")	

		var argsArray = args.replace(/ /g, ",").replace(/\n/g, ",").replace(/\"/g, "'").replace(/\`/g, "'").split(",")

    	for (var i = 0; i < argsArray.length; i++){
    	
    		argsArray[i]=argsArray[i].trim();
    		//console.log(">"+argsArray[i]+"<")
    		
    		if (argsArray[i].startsWith("-")){
    	    	returnObj["options"].push(argsArray[i])   
    		}else if (argsArray[i] == ""){
     		}else if (argsArray[i].startsWith("$")){
    	    	returnObj["accounts"].push(argsArray[i])   
     		}else if (nh.getServer(argsArray[i])){
    	    	returnObj["megaservers"].push(nh.getServer(argsArray[i]))       	    					
     		}else if (nh.getValidInstances(argsArray[i].toLowerCase())){
    	    	returnObj["instance"] = returnObj["instance"].concat(nh.getInstances(argsArray[i].toLowerCase()))       	    					
    		}else if(nh.getCpLvl(argsArray[i])){
    			returnObj["level"].push(nh.getCpLvl(argsArray[i]))
	    	}else if(nh.getQuality(argsArray[i])){
    			returnObj["item_quality"].push(Number(nh.getQuality(argsArray[i])))
	    	}else if(nh.getTrait(argsArray[i])){
    			returnObj["item_trait"].push(Number(nh.getTrait(argsArray[i])))
	    	}else if(fh.isNumeric(argsArray[i])){
    			returnObj["value_num"].push(Number(argsArray[i]))
	    	}else if(argsArray[i].match(isDate)){
    			returnObj["date"].push(argsArray[i])
	    	}else if(argsArray[i].match(/[a.zA-Z]*-[a.zA-Z]*/)){
	    		var range = argsArray[i].split("-");
	    		var rangetype = ""
	    		if(nh.getCpLvl(range[0])){rangetype = "level";range[0]=nh.getCpLvl(range[0]);range[1]=nh.getCpLvl(range[1]) }else{
	    		if(nh.getQuality(range[0])){rangetype = "quality";range[0]=Number(nh.getQuality(range[0]));range[1]=Number(nh.getQuality(range[1])) }else{
	    		if(range[0].match(isDate)){rangetype = "date";}else{
	    		if(fh.isNumeric(range[0])){rangetype = "numeric";}else{
	    			rangetype = "unknown";
	    		}}}}
				if (range[0] < range[1]){
    				returnObj["range"].push({from : range[0], to: range[1], type : rangetype})
    			}else{
	    			returnObj["range"].push({from : range[1], to: range[0], type : rangetype})
    			}
	    	}else{
    			returnObj["others"].push(argsArray[i])	    	
	    	}
       	} // end for		
	}
	
	
	if(returnObj["level"].length == 0){
		returnObj["level"].push("200")
		returnObj["level"].push("210")
	}
	
	console.log(returnObj)
	callback(returnObj);
}
