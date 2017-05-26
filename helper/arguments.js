const nh = require("../helper/names.js")
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

exports.argumentSlicer = function(args, callback){ // add required / optional?

	var returnObj = {
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
		"others"		: [],
		"slice_info"	: []
	}
	var command = new RegExp("\![a-zA-Z]+","i")
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
		console.log("got no question here")	

		var argsArray = args.replace(/ /g, ",").split(",")

    	for (var i = 0; i < argsArray.length; i++){
    	
    		argsArray[i]=argsArray[i].trim();
    		console.log(">"+argsArray[i]+"<")
    		
    		if (argsArray[i].startsWith("-")){
    	    	returnObj["options"].push(argsArray[i])   
    		}else if (argsArray[i].startsWith("$")){
    	    	returnObj["accounts"].push(argsArray[i])   
     		}else if (nh.getServer(argsArray[i])){
    	    	returnObj["megaservers"].push(nh.getServer(argsArray[i]))   				
     		}else if (nh.getInstance(argsArray[i])){
    	    	returnObj["instance"].push(nh.getInstance(argsArray[i]))   				
    		}else if(nh.getCpLvl(argsArray[i])){
    			returnObj["level"].push(nh.getCpLvl(argsArray[i]))
	    	}else if(nh.getQuality(argsArray[i])){
    			returnObj["item_quality"].push(Number(nh.getQuality(argsArray[i])))
	    	}else if(nh.getTrait(argsArray[i])){
    			returnObj["item_trait"].push(Number(nh.getTrait(argsArray[i])))
	    	}else{
    			returnObj["others"].push(argsArray[i])	    	
	    	}
       	} // end for		
	}
	
callback(returnObj);
}
