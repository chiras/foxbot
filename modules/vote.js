const util = require('util')
var jsonfile = require('jsonfile')

const nh = require("../data/name_helper.js")
const dbh = require("../data/db_helper.js")
const moment = require('moment-timezone');


var file = './data/polldump.json'


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

var ongoingPolls = {};

jsonfile.readFile(file, function(err, obj) {
	ongoingPolls = obj;
})

module.exports = (bot, msg, tokens,Discord) => {
	//	if (tokens["tokenset"] == "live"){ 
			jsonfile.writeFile(file, ongoingPolls, function (err) {
 				 console.error(err)
			})
	//	}
        var curChannel = msg.channel.id;       
 		//console.error(curChannel)

        var args = msg.content.split(" ").slice(1).join(" ");

        if (!msg.guild) {
            msg.channel.sendEmbed({
                color: 0x800000,
                description: "Polls only work in guild channels, not in direct messages to the bot."
            });
        return;    
    	}
    	
       	if (args.length == 0) {
                if (ongoingPolls[curChannel]) {

                    msg.channel.sendEmbed({
                        color: 0x800000,
                        title: ongoingPolls[curChannel].question,
                        description: "Valid options for voting are: " + ongoingPolls[curChannel].optionsTxt + "\n\n You can vote by typing \n**!poll 1," + ongoingPolls[curChannel].options.length + "** \nVoting of multiple options is allowed, but not voting the same option twice."
                    });
                } else {
                    msg.channel.sendEmbed({
                        color: 0x800000,
                        title: "Currently, there is no poll in this channel",
                        description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point."
                    });
                } // end if ongoing
        return;    
		}
    	
		var question = "";
       	if (args.match("\\?")){
				args = args.split("?");
		   		question = args.shift() + "?";
 		        args = args.join(" ").split(".");
    	}else{
			args = args.split(" ");    	
    	}
        
        if (question != "") {
                    if (ongoingPolls[curChannel]) {
                        msg.channel.sendEmbed({
                            color: 0x800000,
                            title: "There is already a poll going on in this channel",
                            description: "Switch channels or end the previous poll with\n**!poll end** "
                        });
                    } else {
                        if (args.length > 1) {

                            var start_answers = []
                            var start_votes = []
                            var start_answersTxt = ""

                            for (var i = 1; i <= args.length; i++) {
                            	if (args[i - 1] != ""){
                                	start_answers[i] = args[i - 1].trim();
                                	start_answersTxt += "\n**" + i + ":** " + args[i - 1].trim();
                                	start_votes[i] = [];
                                }
                            }
                            

                            ongoingPolls[curChannel] = {
                                question: question,
                                options: start_answers,
                                optionsTxt: start_answersTxt,
                                votes: start_votes,
                                started: ""
                            }
                            
							
							var len = ongoingPolls[curChannel].options.length - 1;
							
                            msg.channel.sendEmbed({
                                color: 0x800000,
                                title: "Poll has been created",
                                description: "The question is: " + ongoingPolls[curChannel].question + "\n Valid answer options for voting are: " + ongoingPolls[curChannel].optionsTxt + "\n\nYou can vote by typing \n**!poll 1," + len + "** \nVoting of multiple options is allowed, but not voting the same option twice.\n\n Intermediate results can be called by \n**!poll status** \n\nThe poll can be ended with \n**!poll end**"
                            });
                        } else {
                            msg.channel.sendEmbed({
                                color: 0x800000,
                                title: "Poll has NOT been created",
                                description: "You need to provide at least two different answer options, e.g.\n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point. "
                            });
                        } //end if/else more than one answer in setup
                    } //end if/else ongoing in setup
            return;
            }
            
            if (!ongoingPolls[curChannel]) {
                        msg.channel.sendEmbed({
                        color: 0x800000,
                        title: "Currently, there is no poll in this channel",
                        description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point.  "
                    });
            return;      
            }

            if (args[0] == "status"){

            		var statTxt = "";
            
            		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){
            			if (ongoingPolls[curChannel].votes[i].length > 0){
            				var votesz = ongoingPolls[curChannel].votes[i];								
            				statTxt += "\n" +i+ ": "+ votesz.length+ " votes (" + votesz.join(", ") + ")";
            			}else{
            				statTxt += "\n" +i+ ":  0 votes";		
            			}
            			
            		}
           				var len = ongoingPolls[curChannel].options.length - 1;
 		          		
            		
                        msg.channel.sendEmbed({
              				color: 0x800000,
              				title: ongoingPolls[curChannel].question,
              				description: "Poll is ongoing, but current votes are: " + statTxt + "\n\nYou can still vote: " + ongoingPolls[curChannel].optionsTxt + "\n\n You can vote by typing \n**!poll 1," + len + "** \nVoting of multiple options is allowed, but not voting the same option twice."
             			});			
             			
            return;
            }
            
            if (args[0] == "end"){

            		var endTxt = "";
					var maxValue = 0; 
					var options = [];
					var values = [];

            		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){           			
            				var votesz = ongoingPolls[curChannel].votes[i];								
            				if (votesz.length > maxValue){
            					maxValue = votesz.length;
            				};
						
					}

            		for (var i = 1; i < ongoingPolls[curChannel].votes.length; i++){           			
            			var optTxt = ongoingPolls[curChannel].options[i].substring(0,20)
            			if (ongoingPolls[curChannel].options[i].length > 20){
            				optTxt +="..."
            			}
            			if (ongoingPolls[curChannel].votes[i].length > 0){
            				options.push(optTxt)
            				values.push(ongoingPolls[curChannel].votes[i].length)
            				
            				var votesz = ongoingPolls[curChannel].votes[i];	
            				if (votesz.length == maxValue){
	            				endTxt += "\n**" +i+ " ("+ ongoingPolls[curChannel].options[i]+"): "+ votesz.length+ " votes (" + votesz.join(", ") + ")**";
            				}else{
	            				endTxt += "\n" +i+  " ("+ ongoingPolls[curChannel].options[i]+"): " + votesz.length+ " votes (" + votesz.join(", ") + ")";            				
            				}							

            			}else{
  
              				options.push(optTxt)
            				values.push(0)

            				endTxt += "\n" +i+  " ("+ ongoingPolls[curChannel].options[i]+"): 0 votes";		
            			}
            			
            		}
            		var winTxt
            		if (maxValue > 0){
            			 winTxt = "the winners are in bold"
            		}else{
            			 winTxt = "no votes have been cast"            		
            		}
            	
            	var height = values.length * 30 + 30;
            	
				var image = "https://chart.googleapis.com/chart?cht=bhs&chs=400x"+height+"&chd=t:"+values.join(',')+"&chxl=0:|0|"+maxValue+"|1:|"+options.reverse().join('|')+"&chds=a&chco=4D89F9,C6D9FD&chxt=x,y&chf=bg,s,32363c&chxs=0,ffffff,14|1,ffffff,14";
			//	console.log(image);
				image=image.replace(/ /g, "%20")
				//console.log(image);
				            		
  				const embed = new Discord.RichEmbed()
 				  	.setTitle(ongoingPolls[curChannel].question)
  				 //	.setAuthor('Author Name', 'https://i.imgur.com/lm8s41J.png')
  					.setColor(0x800000)
    				.setDescription("Poll has been ended ("+winTxt +"):\n"  + endTxt + "\n\nThe poll has been deleted from this channel.")
    				.setImage(image)


  				msg.channel.sendEmbed(embed);          		
            				
            	delete ongoingPolls[curChannel];          
            return;
            }

                           
            var allvotesTmp = args.join("").replace(/ /g, "").split(",")
                    // if numeric

                    if (!ongoingPolls[curChannel]) {
                        msg.channel.sendEmbed({
                            color: 0x800000,
                            title: "There is no poll going on in this channel",
                        description: "You can create one by typing \n\n**!poll Do we need a healer? No. Yes. Only Off-Heal.**\n\nYou can provide a lot of answer options, just keep them separated by a point.  "
                        });
                    } else {
						var voteTxt = ""
						var allvotes = uniq(allvotesTmp);

                        for (var y = 1; y <= ongoingPolls[curChannel].votes.length; y++) {
                      		if (typeof ongoingPolls[curChannel].votes[y] !== 'undefined' && ongoingPolls[curChannel].votes[y].length > 0) {
							if (ongoingPolls[curChannel].votes[y].includes(msg.author.username)) {
                       			ongoingPolls[curChannel].votes[y].remove(msg.author.username)
                       			voteTxt = "You already voted in this poll. Your previous votes have been cancelled and your new vote is accepted.\n\n"
							}}
						}
						
						var first = 1;	
						
                        for (var z = 0; z < allvotes.length; z++) {
							var valid = 0;
							
				            if (ongoingPolls[curChannel].options.includes(allvotes[z])){
				            		for (var r = 0; r < ongoingPolls[curChannel].options.length; r++){
				            			if (ongoingPolls[curChannel].options[r] == allvotes[z]){
										     valid = 1;
			            		             ongoingPolls[curChannel].votes[r].push(msg.author.username);		
			            		             allvotes[z] = r;            			
				            			}				            		
				            		}
			            	
				            }else{
				            	if (isNumeric(allvotes[z]) && allvotes[z] < ongoingPolls[curChannel].options.length){
					                 ongoingPolls[curChannel].votes[allvotes[z]].push(msg.author.username);
									 valid = 1;
			            	}

				            }
				            if (valid){
          					//var len_tmp = ongoingPolls[curChannel].votes[allvotes[z]].length - 1;
                  			if (first){
            					 voteTxt += "You voted: "
            					 first = 0;
                  			}
	                            voteTxt += "\n  * "+ongoingPolls[curChannel].options[allvotes[z]] + " ("+ongoingPolls[curChannel].votes[allvotes[z]].length+" votes so far)";
				            
				            }
				            if (first == 1){
			            		voteTxt += "No valid votes were provided. Please vote at least one of \n" + ongoingPolls[curChannel].optionsTxt
	            
				            }
                        }

                            msg.channel.sendEmbed({
                                color: 0x800000,
                                title: ongoingPolls[curChannel].question,
                                description: voteTxt 
                            });



                    } // end if/else ongoing	
};
