module.exports = (bot, msg, request, youtube) => {  
const async = require('async');

function getLastWeek(){
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    return lastWeek ;
}

// function parse(url,  out , callback ){
//     out =  out || "Init value";
// 
// 	request({
//         	url: youtubeurlhot,
//         	json: true
//     	}, function(error, response, body) {
// 	
//         if (!error && response.statusCode === 200) {
//   			
//   			var maxcount = 5;
//  			var curcount = 1;
// 
//   			for (var i = 0; curcount <= 5; i++){
//   			
//   			if (body.items[i]){		
//             	out += curcount + ". **" + JSON.stringify(body.items[i].snippet.channelTitle).replace(/\"/g, "") + '**: http://youtube.com/watch?v='+ JSON.stringify(body.items[i].id.videoId).replace(/\"/g, "")+'"\n' + JSON.stringify(body.items[i].snippet.title) +'"\n\n';
// 				curcount++;
// 			}
// 			}
// 			
// 		//	msg.channel.sendMessage(youtubeout);
// 		return callback( out );
//         }
//     })
// 
// }

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      callback(err, body);
    }
  );
}

var lastweek = getLastWeek();   
var youtubeurlhot = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&order=viewCount&publishedAfter="+lastweek.toISOString() +"&q=Elder+Scrolls+Online&type=video&key=AIzaSyCgNeM4jBdyRKdE75loEpw-vPC_seN6L7A";
var youtubeurlnew = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&order=date&publishedAfter="+lastweek.toISOString() +"&q=Elder+Scrolls+Online&type=video&key=AIzaSyCgNeM4jBdyRKdE75loEpw-vPC_seN6L7A";
   
const urls= [
  youtubeurlhot,
  youtubeurlnew
];

const headers= [
  "\n### ** Hot recent ESO videos on YouTube are: ** ",
  "\n### ** Newest ESO videos on YouTube are: **"
];


var out;

async.map(urls, httpGet, function (err, body){
  if (err) return console.log(err);
  			//console.log(body);

  			var youtubeout =  "";
  			var maxcount = 5;
   				
  			for (var j = 0; j <= 1; j++){
  			
 			var curcount = 1;
 			youtubeout += "\n\n..................................................................................................."
   			youtubeout += headers[j];
   			
  			for (var i = 0; curcount <= 3; i++){
  			
  			if (body[j].items[i]){		
            	youtubeout += "\n\n" + curcount + ". *" + JSON.stringify(body[j].items[i].snippet.channelTitle).replace(/\"/g, "") + '*: "http://youtube.com/watch?v='+ JSON.stringify(body[j].items[i].id.videoId).replace(/\"/g, "")+'"\n' + JSON.stringify(body[j].items[i].snippet.title) ;
				curcount++;
			}}}
			  
 			youtubeout += "\n..................................................................................................."
     msg.channel.sendMessage(youtubeout);


});

//console.log(out);

//var youtubeout =   "";
// 
//   			var maxcount = 5;
//  			var curcount = 1;
//    			
//    			youtubeout += "Hot recent ESO videos on YouTube are:\n\n"
// 			
//   			for (var i = 0; curcount <= 5; i++){
//   			
//   			if (body[1].items[i]){		
//             	youtubeout += curcount + ". **" + JSON.stringify(body[1].items[i].snippet.channelTitle).replace(/\"/g, "") + '**: http://youtube.com/watch?v='+ JSON.stringify(body[1].items[i].id.videoId).replace(/\"/g, "")+'"\n' + JSON.stringify(body[1].items[i].snippet.title) +'"\n\n';
// 				curcount++;
// 			}}
			
			
			
//   console.log(youtubeurlhot);
//   console.log(youtubeurlnew);
      
	
// 	parse(youtubeurlhot, "", function( val ) {
//          console.log (val);
//          youtubeout += val;
//          
//          // if you need to return anything, return it here. Do everything else you want to do inside this parse function.
//         // return res.sendStatus( 200 );
//     } );

	
// request({
//         url: youtubeurlhot,
//         json: true
//     }, function(error, response, body) {
// 		
// 		var yttemp = "";
// 		
//         if (!error && response.statusCode === 200) {
//  
// 
//   			
//   			var maxcount = 5;
//  			var curcount = 1;
// 
//   			for (var i = 0; curcount <= 5; i++){
//   			
//   			if (body.items[i]){		
//             	yttemp += curcount + ". **" + JSON.stringify(body.items[i].snippet.channelTitle).replace(/\"/g, "") + '**: http://youtube.com/watch?v='+ JSON.stringify(body.items[i].id.videoId).replace(/\"/g, "")+'"\n' + JSON.stringify(body.items[i].snippet.title) +'"\n\n';
// 				curcount++;
// 			}
// 			}
// 			
// 		//	msg.channel.sendMessage(youtubeout);
// 		callback(null, yttemp);
//         }
//     }))
    
//     youtubeout += "\n\nLatest ESO videos on YouTube are:\n\n"
// 
// 	request({
//         url: youtubeurlnew,
//         json: true
//     }, function(error2, response2, body2) {
// 
//         if (!error2 && response2.statusCode === 200) {
//  
//  
//   			
//   			var maxcount = 5;
//  			var curcount = 1;
// 
//   			for (var i = 0; curcount <= 5; i++){
//   			
//   			if (body2.items[i]){		
//             	youtubeout += curcount + ". **" + JSON.stringify(body2.items[i].snippet.channelTitle).replace(/\"/g, "") + '**: http://youtube.com/watch?v='+ JSON.stringify(body2.items[i].id.videoId).replace(/\"/g, "")+'"\n' + JSON.stringify(body2.items[i].snippet.title) +'"\n\n';
// 				curcount++;
// 			}
// 			}
// 			
// // 		msg.channel.sendMessage(youtubeout)
//         }
//     })
// //  
//   msg.channel.sendMessage(youtubeout);
     
};

