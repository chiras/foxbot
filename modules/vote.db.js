// toDO: only creator + admins can end polls

const util = require('util')
const sqlite3 = require('sqlite3').verbose(); // db module
const Promise = require('bluebird');
const nh = require("../data/name_helper.js")
const moment = require('moment-timezone');

//const request = Promise.promisifyAll(require('request'));

const dbPolls = new sqlite3.Database('./data/dbs/polls.db'); // database file
const dbUsers = new sqlite3.Database('./data/dbs/guilds.db'); // database file

var options = ["start", "status", "vote", "end", "revive", "reset"]

// functions

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

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

function getDbData(db, table, args, callback) {
var query = "SELECT * FROM "+ table +" WHERE "+ setupQuery(args)
console.log(query);
db.serialize(function() {
    db.all(query, function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all);
    });
});
};

function setDbState(db, args, active, callback) {

var query = "UPDATE polls SET active = '"+ active +"' WHERE" + setupQuery(args);

db.serialize(function() {
        db.run(query, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log(query)

            }
        });
});
};

function setDbReset(db, args, callback) {

var query = "DELETE FROM votes WHERE" + setupQuery(args);

db.serialize(function() {
        db.run(query, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log(query)

            }
        });
});
};

function setDbVote(db, user, id, anonym, votes, callback) {

var queryDel = "DELETE FROM votes WHERE ID = '" + id +"' AND user = '"+user+"'";
var queryIns = "INSERT INTO votes (ID, user, anonym, vote) VALUES ";

for (var i = 0; i < votes.length; i++){
	queryIns += "('"+id+"', '"+user+"', '"+anonym+"', '"+votes[i]+"'),"
}
queryIns = queryIns.substring(0, queryIns.length-1);

db.serialize(function() {
	//	db.run(queryDel)
        db.run(queryIns, function(err, row) {
            if (err) {
                console.log(err)
            } else {
                console.log(queryIns)

            }
        });
});
};

function getMaxValue(db, table, value, callback){
var query = "SELECT MAX("+value+") FROM "+table;
console.log(query)
    db.all(query, function(err, all) {
        if (err) {
            console.log(err)
        };
        //     console.log(all)
        callback(err, all);
});

}

function setDbPoll(db, msg, question, answers, anonym, callback) {

getMaxValue(db, "polls", "ID", function(err, value){

var newID = value[0]["MAX(ID)"]+1;

var queryInfo = "INSERT INTO polls (ID, channel, guild, question, active, anonym) VALUES ('"+newID+"','"+msg.channel.id+"','"+msg.guild.id+"','"+question+"','1','"+anonym+"')";
var queryIns = "INSERT INTO answers (ID, answer, number) VALUES ";

for (var i = 1; i < answers.length+1; i++){
	queryIns += "('"+newID+"', '"+answers[i-1].trim().substr(0,50)+"', '"+i+"'),"
}
queryIns = queryIns.substring(0, queryIns.length-1);

db.serialize(function() {
		db.run(queryInfo)
        db.run(queryIns, function(err, row) {
            if (err) {
                console.log(err)
            } else {
                console.log(queryIns)

            }
      		callback(err, newID);

        });
});

})
};

function getUserPermission(bot, db, pollinfo, msg, type, callback){

		  var userquery = {"channel" : pollinfo[0].channel}
		  userquery[type] = 1
		  var allowed = 0;
		  var declineTxt = "";
		  
		  getDbData(db, "channels", userquery, function (err, userinfo){
		  
//		  var user = "219009482024419328"
		  var user = msg.author.id
		  
		  for (var r = 0; r < userinfo.length; r++){
			  var roleId = bot.channels.get(pollinfo[0].channel).guild.roles.find('name', userinfo[r].role).id
			  if (bot.channels.get(pollinfo[0].channel).guild.member(user) != null){
			  	if (bot.channels.get(pollinfo[0].channel).guild.member(user).roles.has(roleId)){
		 	 		allowed = 1;
		 	 	 }else{
		 	  		declineTxt += "You don't have the necessary permissions."		 	  
		 	 	 }
		 	  }else{
		 	  		declineTxt += "It seems to belong to a different guild."
		 	  }
		  }
		  
		callback(allowed, declineTxt);
		})
}

module.exports = (bot, msg, tokens, Discord) => {

        var args = msg.content.split(" ").slice(1);

        var pollID = 0;
        var option = 0;
        var anonym = 0;
        var vargs = [];
        
        if(args.length == 0){
        
        	var query = {"channel" : msg.channel.id, "active" : 1}
        	getDbData(dbPolls, "polls", query, function(err, polls){
        		
        		var activesTxt = "";
        		
        		if (polls.length > 0) {
        			polls.forEach(function(entry) {
        				activesTxt += "\n$"+entry["ID"]+": "+entry["question"]
        			})
        		}else{
        			activesTxt = "There are no active polls in this channel"
        		}
        	
   				var embed = new Discord.RichEmbed()
  					.setColor(0x800000)
					.addField("Active polls in this channel: ",activesTxt)
					.addField("Poll creation:","You can set up a new poll by typing e.g. \n**!poll Do we need a healer? Yes. No. Off-Heal.**\nYou can make all votes anonymous by adding 'anonymous' after the last option.")		
				//	.addField("Vote:","You can now vote with \n**!poll $"+ID+" 1," + answers.length+"**\nVoting of multiple options is allowed, but not voting the same option twice.")		

  				msg.channel.sendEmbed(embed);   
       	
        	
        	})
        
        return;
        }
        
        args.forEach(function(entry) {
          	if (entry.startsWith("$")){ 
          		if (isNumeric(parseInt(entry.substring(1, entry.length)))){
		      		pollID = parseInt(entry.substring(1, entry.length));
		      	}else{
		      		pollID = entry.substring(1, entry.length) + " (IDs are usually only numbers)"; 	
		      	}
		    }else if (options.includes(entry.replace(/ /g, ""))){
		    	option = entry
		    }else if (entry.startsWith("anonym")){
		    	anonym = 1;
		    }else{
		    	vargs.push(entry)
		    }
		});
		        
    	if (msg.content.includes("?")){
         	var qargs = args.join(" ").split("?");
   		
        	var question = qargs[0].substr(0,200).trim() + "?";
        	var answers = qargs.slice(1).join("").split(".")

     		answers = answers.filter(function (item) {
			   return item.trim().indexOf("anonym") !== 0;
			});	

     		answers = answers.filter(function (item) {
			   return item.trim() != '';
			});	
			
     		if (answers.length > 1){
     		
     		    var anonymTxt = "\nVotes are not anonymous by default, but can be made such by adding 'anonym' to the vote call.";
     			if (anonym){
     				anonymTxt = "\nAll votes are anonymous in this poll."
     			}

     		
     			setDbPoll(dbPolls, msg, question, answers, anonym, function (err, ID){ 
     			
     			var answerTxt = "";
     			
     			for (var k = 1; k < answers.length+1;k++){
     				answerTxt += "\n"+k+": \t"+ answers[k-1]
     			}
     			
  				var embed = new Discord.RichEmbed()
  					.setColor(0x800000)
					.addField("Poll $"+ID+" has been created", "Options:\n**!poll $"+ID+" status** --> Intermediate results\n**!poll $"+ID+" reset** --> Clear all votes\n**!poll $"+ID+" end** --> End poll"+ anonymTxt)
					.addField(question, answerTxt)		
					.addField("Vote:","You can now vote with \n**!poll $"+ID+" 1," + answers.length+"**\nVoting of multiple options is allowed, but not voting the same option twice.")		

  				msg.channel.sendEmbed(embed);   
  				
  				})
     		
     		}
    		return;
    	}
	    
	    if (pollID != 0){	
	    
		  var query = {"ID" : pollID}
		  var allowed = 0;
		  var declineTxt = ""

		  getDbData(dbPolls, "polls", query, function (err, pollinfo){
	        	
	  	  if (pollinfo.length == 0){
		
	  	  
        	var query2 = {"channel" : msg.channel.id, "active" : 1}
        	getDbData(dbPolls, "polls", query2, function(err2, polls){
        		
        		var activesTxt = "";
        		
        		if (polls.length > 0) {
        			polls.forEach(function(entry) {
        				activesTxt += "\n$"+entry["ID"]+": "+entry["question"]
        			})
        		}else{
        			activesTxt = "There are no active polls in this channel"
        		}
        	
   				var embed = new Discord.RichEmbed()
  					.setColor(0x800000)
					.addField("Poll $"+pollID,"No poll with that ID has been found")
					.addField("Active polls in this channel: ",activesTxt)
					.addField("Poll creation:","You can set up a new poll by typing e.g. \n**!poll Do we need a healer? Yes. No. Off-Heal.**\nYou can make all votes anonymous by adding 'anonymous' after the last option.")		

  				msg.channel.sendEmbed(embed);   
       	
        	
        	})	  	  	  	
	  	  return;
	  	  }
		getDbData(dbPolls, "answers", query, function (err, answers){	

		if (option == "status" | option == "end" | option ==  "revive" | option ==  "reset" | vargs.length == 0){	  
		
		getUserPermission(bot, dbUsers, pollinfo, msg, "can_create_polls", function(allowed, declineTxt){
				  
		  if (!allowed){
  				var embed = new Discord.RichEmbed()
  					.setColor(0x800000)
					.addField("Poll $"+pollID,"You are not allowed to manage in this poll. "+ declineTxt)

  				msg.channel.sendEmbed(embed);   
  				
  				return; 		  				  
		  }else{		
		    	  
		   var query = {"ID" : pollID}
	  	  		  				
			getDbData(dbPolls, "votes", query, function (err, votings){	
			
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
							anonymtxt = "Anonymous votes: "+ votersAnonym			
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
				if (option == "status"){
					optiText = "\nPoll is ongoing, you can still vote!"
				}else if (option == "end"){
					setDbState(dbPolls, query, 0)
					optiText = "\nPoll has been ended, no votes are counted anymore. But it can be revived anytime by **!poll revive $"+pollID+"**!"				
				}else if (option == "revive"){
					setDbState(dbPolls, query, 1)
					optiText = "\nPoll has been revived, votes are counted again."				
				}else if (option == "reset"){
					setDbReset(dbPolls, query)
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

  				var embed = new Discord.RichEmbed()
 				  	.setTitle("Poll $" + pollID + ": " + pollinfo[0].question.substring(0,240))
  					.setColor(0x800000)
    				.setDescription(voteText + "\n" +optiText)
    				
    			if (printImage){
    				embed.setImage(image)
    			
    			}
    				
  				msg.channel.sendEmbed(embed);   
           							
  	  	  }); // getDbData(votes)
  	  	  
  	  	  } // end allowed
  	  	  }) // end user got permission
  	  	  
		}else{ // end (options == "status" etc) --> vote
			getUserPermission(bot, dbUsers, pollinfo, msg, "can_grptools", function(allowed, declineTxt){
				  
		 	 if (!allowed){
  				var embed = new Discord.RichEmbed()
  					.setColor(0x800000)
					.addField("Poll $"+pollID,"You are not allowed to participate in this poll. "+ declineTxt)

  				msg.channel.sendEmbed(embed);   
  				
  				return; 		  				  
		  	}else{		
		    	  
	  	  	var query = {"ID" : pollID}

			// use this as votes, if separated by comma or space
			var votesNew = vargs.join(",").split(",");
			for (var i = 0; i < votesNew.length; i++){    
				votesNew[i] = votesNew[i].trim();
			}
		
			var invalidTxt = ""
			
     		votesNew = votesNew.filter(function (item) {
			   return isNumeric(item);
			});	

     		votesNew = votesNew.filter(function (item) {
			   return item < answers.length+1;
			});	
			
			if(votesNew.length != vargs.join(",").split(",").length){
				invalidTxt = " and invalid votes were ignored"
			}
				
			setDbVote(dbPolls, msg.author.id,pollID, anonym, votesNew)
			
			var anonymtxt = "" 

				if (anonym){
					anonymtxt = " (Your vote is anonymous)"
				}
		
  				var embed = new Discord.RichEmbed()
 				  	.setTitle("Poll $" + pollID + ": " + pollinfo[0].question.substring(0,240))
  					.setColor(0x800000)
    				.setDescription("You have voted " + votesNew.join(", ") + invalidTxt+ anonymtxt)
 
  				msg.channel.sendEmbed(embed);   
  				
  	  	  } // end allowed
  	  	  }) // end user got permission								
		} // end option vote
		}); // getDbData(answers)
		
		
   		}); // getDbData(pollinfo)
	    } // end (pollID != 0)
    	
    	
  //   		
//     	
//     	})
//     	
//        	if (args.length == 0) {
//                 if (ongoingPolls[curChannel]) {
// 
//                     msg.channel.sendEmbed({
//                         color: 0x800000,
//                         title: ongoingPolls[curChannel].question,
//                         description: "Valid options for voting are: " + ongoingPolls[curChannel].optionsTxt + "\n\n You can vote by typing \n**!poll 1," + ongoingPolls[curChannel].options.length + "** \nVoting of multiple options is allowed, but not voting the same option twice."
//                     });
//                 } else {
//                     msg.channel.sendEmbed({
//                         color: 0x800000,
//                         title: "Currently, there is no poll in this channel",
//                         description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point."
//                     });
//                 } // end if ongoing
//         return;    
// 		}
//     	
// 		var question = "";
//        	if (args.match("\\?")){
// 				args = args.split("?");
// 		   		question = args.shift() + "?";
//  		        args = args.join(" ").split(".");
//     	}else{
// 			args = args.split(" ");    	
//     	}
//         
//         if (question != "") {
//                     if (ongoingPolls[curChannel]) {
//                         msg.channel.sendEmbed({
//                             color: 0x800000,
//                             title: "There is already a poll going on in this channel",
//                             description: "Switch channels or end the previous poll with\n**!poll end** "
//                         });
//                     } else {
//                         if (args.length > 1) {
// 
//                             var start_answers = []
//                             var start_votes = []
//                             var start_answersTxt = ""
// 
//                             for (var i = 1; i <= args.length; i++) {
//                             	if (args[i - 1] != ""){
//                                 	start_answers[i] = args[i - 1].trim();
//                                 	start_answersTxt += "\n**" + i + ":** " + args[i - 1].trim();
//                                 	start_votes[i] = [];
//                                 }
//                             }
//                             
// 
//                             ongoingPolls[curChannel] = {
//                                 question: question,
//                                 options: start_answers,
//                                 optionsTxt: start_answersTxt,
//                                 votes: start_votes,
//                                 started: ""
//                             }
//                             
// 							
// 							var len = ongoingPolls[curChannel].options.length - 1;
// 							
//                             msg.channel.sendEmbed({
//                                 color: 0x800000,
//                                 title: "Poll has been created",
//                                 description: "The question is: " + ongoingPolls[curChannel].question + "\n Valid answer options for voting are: " + ongoingPolls[curChannel].optionsTxt + "\n\nYou can vote by typing \n**!poll 1," + len + "** \nVoting of multiple options is allowed, but not voting the same option twice.\n\n Intermediate results can be called by \n**!poll status** \n\nThe poll can be ended with \n**!poll end**"
//                             });
//                         } else {
//                             msg.channel.sendEmbed({
//                                 color: 0x800000,
//                                 title: "Poll has NOT been created",
//                                 description: "You need to provide at least two different answer options, e.g.\n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point. "
//                             });
//                         } //end if/else more than one answer in setup
//                     } //end if/else ongoing in setup
// 			jsonfile.writeFile(file, ongoingPolls, function (err) {
//  				 if(err){console.error(err)}
// 			})
//             return;
//             }
//             
//             if (!ongoingPolls[curChannel]) {
//                         msg.channel.sendEmbed({
//                         color: 0x800000,
//                         title: "Currently, there is no poll in this channel",
//                         description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point.  "
//                     });
// 			jsonfile.writeFile(file, ongoingPolls, function (err) {
//  				 if(err){console.error(err)}
// 			})
//             return;      
//             }
// 
//             if (args[0] == "status"){
// 
//             		var statTxt = "";
//             
//             		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){
//             			if (ongoingPolls[curChannel].votes[i].length > 0){
//             				var votesz = ongoingPolls[curChannel].votes[i];								
//             				statTxt += "\n" +i+ ": "+ votesz.length+ " votes (" + votesz.join(", ") + ")";
//             			}else{
//             				statTxt += "\n" +i+ ":  0 votes";		
//             			}
//             			
//             		}
//            				var len = ongoingPolls[curChannel].options.length - 1;
//  		          		
//             		
//                         msg.channel.sendEmbed({
//               				color: 0x800000,
//               				title: ongoingPolls[curChannel].question,
//               				description: "Poll is ongoing, but current votes are: " + statTxt + "\n\nYou can still vote: " + ongoingPolls[curChannel].optionsTxt + "\n\n You can vote by typing \n**!poll 1," + len + "** \nVoting of multiple options is allowed, but not voting the same option twice."
//              			});			
//  			jsonfile.writeFile(file, ongoingPolls, function (err) {
//  				 if(err){console.error(err)}
// 			})            			
//             return;
//             }
//             
//             if (args[0] == "end"){
// 
//             		var endTxt = "";
// 					var maxValue = 0; 
// 					var options = [];
// 					var values = [];
// 
//             		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){           			
//             				var votesz = ongoingPolls[curChannel].votes[i];								
//             				if (votesz.length > maxValue){
//             					maxValue = votesz.length;
//             				};
// 						
// 					}
// 
//             		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){           			
//             			var optTxt = ongoingPolls[curChannel].options[i].substring(0,20)
//             			if (ongoingPolls[curChannel].options[i].length > 20){
//             				optTxt +="..."
//             			}
//             			if (ongoingPolls[curChannel].votes[i].length > 0){
//             				options.push(optTxt)
//             				values.push(ongoingPolls[curChannel].votes[i].length)
//             				
//             				var votesz = ongoingPolls[curChannel].votes[i];	
//             				if (votesz.length == maxValue){
// 	            				endTxt += "\n**" +i+ " ("+ ongoingPolls[curChannel].options[i]+"): "+ votesz.length+ " votes (" + votesz.join(", ") + ")**";
//             				}else{
// 	            				endTxt += "\n" +i+  " ("+ ongoingPolls[curChannel].options[i]+"): " + votesz.length+ " votes (" + votesz.join(", ") + ")";            				
//             				}							
// 
//             			}else{
//   
//               				options.push(optTxt)
//             				values.push(0)
// 
//             				endTxt += "\n" +i+  " ("+ ongoingPolls[curChannel].options[i]+"): 0 votes";		
//             			}
//             			
//             		}
//             		var winTxt
//             		if (maxValue > 0){
//             			 winTxt = "the winners are in bold"
//             		}else{
//             			 winTxt = "no votes have been cast"            		
//             		}
//             	
//             	var height = values.length * 30 + 30;
//             	
// 				var image = "https://chart.googleapis.com/chart?cht=bhs&chs=400x"+height+"&chd=t:"+values.join(',')+"&chxl=0:|0|"+maxValue+"|1:|"+options.reverse().join('|')+"&chds=a&chco=4D89F9,C6D9FD&chxt=x,y&chf=bg,s,32363c&chxs=0,ffffff,14|1,ffffff,14";
// 			//	console.log(image);
// 				image=image.replace(/ /g, "%20")
// 				//console.log(image);
// 				            		
//   				const embed = new Discord.RichEmbed()
//  				  	.setTitle(ongoingPolls[curChannel].question)
//   				 //	.setAuthor('Author Name', 'https://i.imgur.com/lm8s41J.png')
//   					.setColor(0x800000)
//     				.setDescription("Poll has been ended ("+winTxt +"):\n"  + endTxt + "\n\nThe poll has been deleted from this channel.")
//     				.setImage(image)
// 
// 
//   				msg.channel.sendEmbed(embed);          		
//             				
//             	delete ongoingPolls[curChannel];          
// 			jsonfile.writeFile(file, ongoingPolls, function (err) {
//  				 if(err){console.error(err)}
// 			})            
// 			return;
//             }
// 
//                            
//             var allvotesTmp = args.join("").replace(/ /g, "").split(",")
//                     // if numeric
// 
//                     if (!ongoingPolls[curChannel]) {
//                         msg.channel.sendEmbed({
//                             color: 0x800000,
//                             title: "There is no poll going on in this channel",
//                         description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point.  "
//                         });
//                     } else {
// 						var voteTxt = ""
// 						var allvotes = uniq(allvotesTmp);
// 
//                         for (var y = 1; y <= ongoingPolls[curChannel].votes.length; y++) {
//                       		if (typeof ongoingPolls[curChannel].votes[y] !== 'undefined' && ongoingPolls[curChannel].votes[y].length > 0) {
// 							if (ongoingPolls[curChannel].votes[y].includes(msg.author.username)) {
//                        			ongoingPolls[curChannel].votes[y].remove(msg.author.username)
//                        			voteTxt = "You already voted in this poll. Your previous votes have been cancelled and your new vote is accepted.\n\n"
// 							}}
// 						}
// 						
// 						var first = 1;	
// 						
//                         for (var z = 0; z < allvotes.length; z++) {
// 							var valid = 0;
// 							
// 				            if (ongoingPolls[curChannel].options.includes(allvotes[z])){
// 				            		for (var r = 0; r < ongoingPolls[curChannel].options.length; r++){
// 				            			if (ongoingPolls[curChannel].options[r] == allvotes[z]){
// 										     valid = 1;
// 			            		             ongoingPolls[curChannel].votes[r].push(msg.author.username);		
// 			            		             allvotes[z] = r;            			
// 				            			}				            		
// 				            		}
// 			            	
// 				            }else{
// 				            	if (isNumeric(allvotes[z]) && allvotes[z] < ongoingPolls[curChannel].options.length){
// 					                 ongoingPolls[curChannel].votes[allvotes[z]].push(msg.author.username);
// 									 valid = 1;
// 			            	}
// 
// 				            }
// 				            if (valid){
//           					//var len_tmp = ongoingPolls[curChannel].votes[allvotes[z]].length - 1;
//                   			if (first){
//             					 voteTxt += "You voted: "
//             					 first = 0;
//                   			}
// 	                            voteTxt += "\n  * "+ongoingPolls[curChannel].options[allvotes[z]] + " ("+ongoingPolls[curChannel].votes[allvotes[z]].length+" votes so far)";
// 				            
// 				            }
// 				            if (first == 1){
// 			            		voteTxt += "No valid votes were provided. Please vote at least one of \n" + ongoingPolls[curChannel].optionsTxt
// 	            
// 				            }
//                         }
// 
//                             msg.channel.sendEmbed({
//                                 color: 0x800000,
//                                 title: ongoingPolls[curChannel].question,
//                                 description: voteTxt 
//                             });
// 
// 
// 			jsonfile.writeFile(file, ongoingPolls, function (err) {
//  				 if(err){console.error(err)}
// 			})
//                     } // end if/else ongoing	
};
