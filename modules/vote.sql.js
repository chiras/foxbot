// toDO: only creator + admins can end polls

const util = require('util')
const Promise = require('bluebird');
const moment = require('moment-timezone');

const nh = require("../data/name_helper.js")
const mh = require("../helper/messages.js")
const ah = require("../helper/arguments.js")
const fh = require("../helper/functions.js")
const dh = require("../helper/db.js")

//const request = Promise.promisifyAll(require('request'));

// const dbPolls = new sqlite3.Database('./data/dbs/polls.db'); // database file
// const dbUsers = new sqlite3.Database('./data/dbs/guilds.db'); // database file

var options = ["start", "status", "vote", "end", "revive", "reset"]

var polltexts = {
	"changes" 	: ["Changes to the poll command:","Use ** !vote $ID** for votes now, you can whisper the bot directly. The ** !poll ** command is now only used for start/status/end of polls!\nYou can make our vote anonymous by adding '-anonym' after the last option in a whisper to the bot."],
	"wrongID"	: ["Wrong Poll ID","IDs are usually only numbers."],
	"creation" 	: ["Poll creation:","You can set up a new poll by typing e.g. \n**!poll Do we need a healer? Yes. No. Off-Heal.**\nYou can make all votes in this poll anonymous by adding '-anonym' after the last option."]		
}

// functions
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// database functions

function setupQuery(array){
	var query = "";
	for (var k in array) {
        if (array.hasOwnProperty(k)) {
           query += " "+ k +" = '"+array[k]+ "' AND ";
        }
	}
	return query.substring(0, query.length-4);
}

// 
//         dh.mysqlQuery(mysql, query2, function(error, resultsDate) {
//             callback(error, {
//                 "id": resultsMax[0]['MAX(dateid)'],
//                 "date": resultsDate[0]['date']
//             })
//         })
//         

function getDbData(mysql, table, args, callback) {
var query = "SELECT * FROM "+ table +" WHERE "+ setupQuery(args)
console.log(query);

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
};


function getUserPolls(mysql, msg, bot, callback){
			console.log("get user guilds")
				var guilds_allowed=[]
				var polls_allowed={}
				var query = {"active" : 1}
				
        		getDbData(mysql, "polls", query, function(err, polls){
        		
        			if (msg.guild){
						guilds_allowed = [msg.guild]
					}else{
					
						for (var i = 0; i < polls.length;i++){							
							getUserPermissionGuild(bot, polls[i].guild, msg, function(allowed, declinetxt){
		      					if (allowed){
		      					//	console.log(polls[i])
      								polls_allowed[polls[i].id] = polls[i]
      							}
      						})
						}
					}
  				
   				callback(polls_allowed)
     			
        		})
}




function getDbState(mysql, args, callback) {

var query = "SELECT id, active FROM polls WHERE id = " + args;

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
       
};


function setDbState(mysql, args, active, callback) {

var query = "UPDATE polls SET active = '"+ active +"' WHERE" + setupQuery(args);

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        //callback(err, all);
    });
       
};

function setDbReset(mysql, args, callback) {

var query = "DELETE FROM polls_votes WHERE" + setupQuery(args);

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });
};

function setDbVote(mysql, user, id, anonym, votes, callback) {
	console.log("-------------------------------:")

getDbState(mysql, id, function(err, active){	
	if (active[0]["active"]){
	
var queryDel = "DELETE FROM polls_votes WHERE id = '" + id +"' AND user = '"+user+"'";
var queryIns = "INSERT INTO polls_votes (id, user, anonym, vote) VALUES";

for (var i = 0; i < votes.length; i++){
	queryIns += "('"+id+"', '"+user+"', '"+anonym+"', '"+votes[i]+"'),"
}
queryIns = queryIns.substring(0, queryIns.length-1);

dh.mysqlQuery(mysql, queryDel, function(err, all) {
        if (err) {
            console.log(err)
        };

dh.mysqlQuery(mysql, queryIns, function(err2, all2) {
        if (err) {
            console.log(err2)
        };
		callback("", true)
    });
 });   
	
	}else{
		callback("", false)
	}
})
}


function getMaxValue(mysql, table, value, callback){
var query = "SELECT MAX("+value+") FROM "+table;
console.log(query)

dh.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(err, all);
    });

}

function setDbPoll(mysql, msg, question, answers, anonym, callback) {

getMaxValue(mysql, "polls", "id", function(err, value){

var newID = value[0]["MAX(id)"]+1;

var queryInfo = "INSERT INTO polls (id, channel, guild, question, active, anonym) VALUES ('"+newID+"','"+msg.channel.id+"','"+msg.guild.id+"','"+question+"','1','"+anonym+"')";
var queryIns = "INSERT INTO polls_answers (id, answer, number) VALUES ";

for (var i = 1; i < answers.length+1; i++){
	queryIns += "('"+newID+"', '"+answers[i-1].trim().substr(0,50)+"', '"+i+"'),"
}

queryIns = queryIns.substring(0, queryIns.length-1);

dh.mysqlQuery(mysql, queryInfo, function(err, all) {
        if (err) {
            console.log(err)
        };
dh.mysqlQuery(mysql, queryIns, function(err2, all2) {
        if (err) {
            console.log(err2)
        };

        callback(err, newID);
    });
});

})
};

function getUserPermissionGuild(bot, guild, msg, callback){

		  var allowed = 0;
		  var declineTxt = "";
		  var user = msg.author.id
		 // var user = "219009482024419328"

		  console.log("Permission check 2"+guild)
//		  console.log(bot.guilds.get(guild))
		  
		  var validUser = bot.guilds.get(guild).members.find('id', user)
		  console.log("Valid"+user+"-->"+validUser)

		  if (validUser  != null ){
		  	 allowed = 1;
		  }else{
			 declineTxt += "It seems to belong to a different guild."
		  }
		  
		callback(allowed, declineTxt);
	//	})
}

function getUserPermission(bot, mysql, pollinfo, msg, type, callback){

		  var userquery = {"channel" : pollinfo[0].channel}
		  userquery[type] = 1
		  var allowed = 0;
		  var declineTxt = "";
		  
		//  getDbData(db, "channels", userquery, function (err, userinfo){
		  
		  var user = msg.author.id
		 // var user = "219009482024419328"
		  console.log("Permission check")
		  
		  var validUser = bot.channels.get(pollinfo[0].channel).guild.members.find('id', user)
		  console.log("Valid"+user+"-->"+validUser)

		  if (validUser  != null ){
		  	 allowed = 1;
		  }else{
			 declineTxt += "It seems to belong to a different guild."
		  }
		  // 
// 		  for (var r = 0; r < userinfo.length; r++){
// 			  var roleId = bot.channels.get(pollinfo[0].channel).guild.roles.find('name', userinfo[r].role).id
// 			  if (bot.channels.get(pollinfo[0].channel).guild.member(user) != null){
// 			  	if (bot.channels.get(pollinfo[0].channel).guild.member(user).roles.has(roleId)){
// 		 	 		allowed = 1;
// 		 	 	 }else{
// 		 	  		declineTxt += "You don't have the necessary permissions."		 	  
// 		 	 	 }
// 		 	  }else{
// 		 	  		declineTxt += "It seems to belong to a different guild."
// 		 	  }
// 		  }
		  
		callback(allowed, declineTxt);
	//	})
}


module.exports = (bot, msg, tokens, options, mysql, Discord) => {
   		
   		var embed = mh.prepare(Discord)
   		
        var args = msg.content.split(" ").slice(1);

        var pollID = 0;
        var option = options.others;
        var anonym = 0;
        var vargs = options.value_num;
        
        if(options.accounts.length == 0 & options.question.length == 0){
        	// case: no arguments provided --> list existing and help
        	// only in channels? guilds? direct messages?
        	// in direct messages, skip poll creation
        
        	var query = {"channel" : msg.channel.id, "active" : 1}
        	getDbData(mysql, "polls", query, function(err, polls){
        		
        		var activesTxt = "";
        		
        		if (polls.length > 0) {
        			polls.forEach(function(entry) {
        				activesTxt += "\n$"+entry["id"]+": "+entry["question"]
        			})
        		}else{
        			activesTxt = "There are no active polls for you to vote"
        		}
        	
				embed.addField("Active polls in this channel: ",activesTxt)
				console.log("gID"+msg.guild)
				if (msg.guild){
					embed.addField(polltexts["creation"][0],polltexts["creation"][1])		
				}
				embed.addField(polltexts["changes"][0],polltexts["changes"][1])
				//	.addField("Vote:","You can now vote with \n**!poll $"+ID+" 1," + answers.length+"**\nVoting of multiple options is allowed, but not voting the same option twice.")		

				mh.send(msg,embed,options)       	
        	
        	})
        
        return;
        }
        
 		for (var i = 0; i < options.accounts.length; i++){
 			if (fh.isNumeric(parseInt(options.accounts[i].substring(1, options.accounts[i].length)))){
		      	pollID = parseInt(options.accounts[i].substring(1, options.accounts[i].length));
 			}else{
				embed.addField(polltexts["wrongID"][0],polltexts["wrongID"][1])
 			}
 		}

  		for (var i = 0; i < options.options.length; i++){
 			if (options.options[i] == "-anonym"){
		    	anonym = 1;
 		}}
 		

		// not sure about this
		  //  }else if (options.includes(entry.replace(/ /g, ""))){
		  //  	option = entry
		        
		
    	if (options.question.length != 0){
    	   	// setting up a new poll
    	   	
        	var question = options.question[0];
        	var answers = options.answers;

     		answers = answers.filter(function (item) {
			   return item.trim().indexOf("anonym") !== 0;
			});	

     		answers = answers.filter(function (item) {
			   return item.trim() != '';
			});	
			
     		if (answers.length > 1){
     		
     		    var anonymTxt = " Votes are not anonymous by default, but can be made such by adding '-anonym' to the vote call.";
     			if (anonym){
     				anonymTxt = " All votes are anonymous in this poll."
     			}

     			setDbPoll(mysql, msg, question, answers, anonym, function (err, id){ 
     			
     			var answerTxt = "";
     			
     			for (var k = 1; k < answers.length+1;k++){
     				answerTxt += "\n"+k+": \t"+ answers[k-1]
     			}
     			
				embed.addField("Poll $"+id+" has been created", "Options:\n**!poll $"+id+" status** --> Intermediate results\n**!poll $"+id+" reset** --> Clear all votes\n**!poll $"+id+" end** --> End poll")
				embed.addField(question, answerTxt)		
				embed.addField("Vote:","You can now vote with \n**!vote $"+id+" 1," + answers.length+"**\nVoting of multiple options is allowed, but not voting the same option twice. Votes should be made in direct whisper to the bot."+ anonymTxt)		

				mh.send(msg,embed,options) 
				
  				})
     		
     		}
    		return;
    	}
		console.log("pollID = "+pollID)
	    
	    if (pollID != 0){	
	    
		  var query = {"id" : pollID}
		  var allowed = 0;
		  var declineTxt = ""

		  getDbData(mysql, "polls", query, function (err, pollinfo){
	        	
	  	  if (pollinfo.length == 0){
	  	  
	  	  getUserPolls(mysql, msg, bot, function(polls){
	  	  			var guilds = {};
	  	  			for (var i = 0; i< Object.keys(polls).length;i++){
	  	  				console.log(polls[Object.keys(polls)[i]].guild)
	  	  				if(typeof guilds[polls[Object.keys(polls)[i]].guild] === "undefined"){
	  	  					guilds[polls[Object.keys(polls)[i]].guild] = []
	  	  				}
	  	  				guilds[polls[Object.keys(polls)[i]].guild].push(polls[Object.keys(polls)[i]].id)
	  	  			}
	  	  			console.log(guilds)
	  	  			//embed.addTitle("All polls you currently have access to:")
	  	  			
	  	  			for (var i = 0; i< Object.keys(guilds).length;i++){
	  	  			var polltxt=""
	  	  			for (var j = 0; j< guilds[Object.keys(guilds)[i]].length;j++){
	  	  					polltxt+= "\n$"+guilds[Object.keys(guilds)[i]][j]+": "+polls[guilds[Object.keys(guilds)[i]][j]].question
	  	  				}
						embed.addField(bot.guilds.get(Object.keys(guilds)[i]),polltxt)
	  	  			}	 
	  	  			 	  			
			//		.addField("Poll $"+pollID,"No poll with that ID has been found")
			//		.addField("Active polls in this channel: ",activesTxt)
			//		.addField("Poll creation:","You can set up a new poll by typing e.g. \n**!poll Do we need a healer? Yes. No. Off-Heal.**\nYou can make all votes anonymous by adding 'anonymous' after the last option.")		

  				mh.send(msg,embed,options) 
	  	  
	  	  })		
	  	  
//         	var query2 = {"channel" : msg.channel.id, "active" : 1}
//         	getDbData(dbPolls, "polls", query2, function(err2, polls){
//         		
//         		var activesTxt = "";
//         		
//         		if (polls.length > 0) {
//         			polls.forEach(function(entry) {
//         				activesTxt += "\n$"+entry["ID"]+": "+entry["question"]
//         			})
//         		}else{
//         			activesTxt = "There are no active polls in this channel"
//         		}
        	
       	
        	
        	//})	  	  	  	
	  	  return;
	  	  }
		getDbData(mysql, "polls_answers", query, function (err, answers){	

		if (option == "status" | option == "end" | option ==  "revive" | option ==  "reset" | vargs.length == 0){	  
		
		getUserPermission(bot, mysql, pollinfo, msg, "can_create_polls", function(allowed, declineTxt){
				  
		  if (!allowed){
					embed.addField("Poll $"+pollID,"You are not allowed to manage in this poll. "+ declineTxt)

  				mh.send(msg,embed,options) 
  				
  				return; 		  				  
		  }else{		
		    	  
		   var query = {"id" : pollID}
	  	  		  				
			getDbData(mysql, "polls_votes", query, function (err, votings){	
			
	  	  	var voteText = ""
	  	  	var optiText = ""
	  
			var votes = {};
			var voters = {};
			var anonym = {};

			var chartValues = []
			var chartText = []
			var maxValue = 0;
			var printImage = 1;
				
			if (votings.length > 0){
			
			votings.forEach(function(entry){
				if (votes[entry["vote"]]){
					votes[entry["vote"]]++;
					voters[entry["vote"]].push(entry["user"])
					anonym[entry["vote"]].push(entry["anonym"])
				}else{
					votes[entry["vote"]] = 1;
					voters[entry["vote"]] = [entry["user"]]
					anonym[entry["vote"]] = [entry["anonym"]]					
				}
			})
			console.log(votes);
			console.log(voters);
			console.log(anonym);

			}else{
				voteText += "No votes have been cast so far." // + getChoices()
				printImage = 0;
			} // end if answers
	  	  							
				answers.forEach(function(answer){

					var votersUsers = [];
					var votersAnonym = 0;
					var anonymtxt = "" 

					if (voters[answer.number]){
					for (var i = 0; i < voters[answer.number].length;i++){
						if (anonym[answer.number][i]){
							votersAnonym++;
							anonymtxt = " Anonymous votes: "+ votersAnonym			
						}else{
							console.log(voters[answer.number])
							votersUsers.push("<@"+voters[answer.number][i]+">")
						}
					}}else{
						votes[answer.number] = 0;
					}

					chartValues.push(votes[answer.number])
					chartText.push(answer.answer.substring(0,20))
					if (votes[answer.number]>maxValue){
						maxValue = votes[answer.number];
					}

					voteText += "\n" + answer.number + " ("+answer.answer+"): " + votes[answer.number] +  " ";
					voteText += "votes"
					if (votersUsers.length > 0){
						voteText += " by "+votersUsers.join(", ") + " " 
					}
					voteText += anonymtxt;
				})								
				
				// output and db updates for the different cases
		// 		if (option == "status"){
// 	//			getDbState(mysql, id, function(err, active){	
// //	if (active[0]["active"]){
// 
// 					optiText = "\nPoll is ongoing, you can still vote!"
	//			}else 
				if (option == "end"){
					setDbState(mysql, query, 0)
					optiText = "\nPoll has been ended, no votes are counted anymore. But it can be revived anytime by **!poll revive $"+pollID+"**!"				
				}else if (option == "revive"){
					setDbState(mysql, query, 1)
					optiText = "\nPoll has been revived, votes are counted again."				
				}else if (option == "reset"){
					setDbReset(mysql, query)
					optiText = "\nThese were the results so far. All votes have now been cleared. "					
				}else{
					if (pollinfo[0].active){
						optiText = "\nPoll is active, you can vote."				
					}else{
						optiText = "\nPoll is inactive. But it can be revived anytime by **!poll revive $"+pollID+"**!"									
					}
				}	
				
             	var height = answers.length * 30 + 30;             	
 				var image = "https://chart.googleapis.com/chart?cht=bhs&chs=400x"+height+"&chd=t:"+chartValues.join(',')+"&chxl=0:|0|"+maxValue+"|1:|"+chartText.reverse().join('|')+"&chds=a&chco=4D89F9,C6D9FD&chxt=x,y&chf=bg,s,32363c&chxs=0,ffffff,14|1,ffffff,14";

 				  	embed.setTitle("Poll $" + pollID + ": " + pollinfo[0].question.substring(0,240))
    				embed.setDescription(voteText + "\n" +optiText)
    				
    			if (printImage){
    				embed.setImage(image)
    			
    			}
    				
  				mh.send(msg,embed,options) 
           							
  	  	  }); // getDbData(votes)
  	  	  
  	  	  } // end allowed
  	  	  }) // end user got permission
  	  	  
		}else{ // end (options == "status" etc) --> vote
			getUserPermission(bot, mysql, pollinfo, msg, "can_grptools", function(allowed, declineTxt){
				  
		 	 if (!allowed){
					embed.addField("Poll $"+pollID,"You are not allowed to participate in this poll. "+ declineTxt)

  				mh.send(msg,embed,options) 
  				
  				return; 		  				  
		  	}else{		
		    	  
	  	  	var query = {"id" : pollID}

			// use this as votes, if separated by comma or space
			var votesNew = vargs.join(",").split(",");
			for (var i = 0; i < votesNew.length; i++){    
				votesNew[i] = votesNew[i].trim();
			}
		
			var invalidTxt = ""
			
     		votesNew = votesNew.filter(function (item) {
			   return fh.isNumeric(item);
			});	

     		votesNew = votesNew.filter(function (item) {
			   return item < answers.length+1;
			});	
			
			if(votesNew.length != vargs.join(",").split(",").length){
				invalidTxt = " and invalid votes were ignored"
			}
				
			setDbVote(mysql, msg.author.id,pollID, anonym, votesNew, function(errx,reply){
						var anonymtxt = "" 
				if (reply){
				if (anonym){
					anonymtxt = " (Your vote is anonymous)"
				}
		
 				  	embed.setTitle("Poll $" + pollID + ": " + pollinfo[0].question.substring(0,240))
    				embed.setDescription("You have voted " + votesNew.join(", ") + invalidTxt+ anonymtxt)				
				}else{
 				  	embed.setTitle("Poll $" + pollID + ": " + pollinfo[0].question.substring(0,240))
    				embed.setDescription("This poll is inactive, your vote has not been recorded. It can be revived anytime by !poll revive $20!")				
					
				}

  				mh.send(msg,embed,options) 
			
			})
 
  				
  	  	  } // end allowed
  	  	  }) // end user got permission								
		} // end option vote
		}); // getDbData(answers)
		
		
   		}); // getDbData(pollinfo)
	    } // end (pollID != 0)
    	
};
