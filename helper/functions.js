
exports.pad = function(n) {
    return n < 10 ? '0' + n : n
}



exports.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.uniqArray = function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

exports.capitalFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.kFormatter = function(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num
}

exports.uniq = function(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

exports.containsNonLatinCodepoints = function(s) {
    return /[^\u0000-\u00ff]/.test(s);
}

exports.removeElement = function(ary, elem) {
    var i = ary.indexOf(elem);
    if (i >= 0) ary.splice(i, 1);
    return ary;
}

exports.getKeyByValue = function(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}