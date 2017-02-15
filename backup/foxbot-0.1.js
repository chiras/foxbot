// npm i --save --no-optional discord.js
// npm i --save --no-optional https://github.com/request/request

var Discord = require("discord.js");
var bot = new Discord.Client();
var request = require("request")

var pledgeurl = "https://esoleaderboards.com/api/getpledges.php"
 
bot.on("message", (msg) => {
  // Set the prefix
  let prefix = "!";
  // Exit and stop if it's not there
  if(!msg.content.startsWith(prefix)) return;
  if(msg.author.bot) return;  

  if (msg.content.startsWith(prefix + "pledges")) {
  
	request({
	    url: pledgeurl,
    	json: true
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {
        //	console.log(body) // Print the json response
            console.log(`Pledge-Request ("${msg.createdAt}"): "${msg.author.username}" of "${msg.guild.name}"` );
            // of "${guild.name}"
		    msg.channel.sendMessage("Pledges today are: " + JSON.stringify(body[1]) + ", "+ JSON.stringify(body[2]) + " and "+ JSON.stringify(body[3]) + "!");
    	}
	})

  
  } 

  else if (msg.content.startsWith(prefix + "fox")) {
    msg.channel.sendMessage("Yeah, the FOX!");
  }
});

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.login("MjUxNDQzNjcxNTQxNDgxNDcy.CxnYrA.fu885Vdi4sb5_idkIqcAdVlf5XA");
