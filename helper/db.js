
exports.mysqlQuery = function(mysql, query, callback) {
mysql.getConnection(function(err, con) {
//	console.log(query)
	if (err) console.log(err);
	con.query(query, function (error, results, fields) {
	  	if (error) console.log(error);
	  //	console.log(results)
	  	con.release();
	  	callback(error, results)
	});
  })

}; 


exports.setupQuery = function(array) {
    var query = "";
    for (var k in array) {
        if (array.hasOwnProperty(k)) {
            query += " " + k + " = '" + array[k] + "' AND ";
        }
    }
    return query.substring(0, query.length - 4);
}

exports.getDbData = function(mysql, table, args, callback) {
    var query = "SELECT * FROM " + table + " WHERE " + this.setupQuery(args)
    // console.log(query);

    this.mysqlQuery(mysql, query, function(err, all) {
        if (err) {
            console.log(err)
        };
        callback(all);
    });
};