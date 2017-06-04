
exports.mysqlQuery = function(mysql, query, callback) {
mysql.getConnection(function(err, con) {
	console.log(query)
	con.query(query, function (error, results, fields) {
	  	if (error) console.log(error);
	  	console.log(results)
	  	con.release();
	  	callback(error, results)
	});
  })

}; 

