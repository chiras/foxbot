
exports.pad = function(n) {
    return n < 10 ? '0' + n : n
}

exports.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}