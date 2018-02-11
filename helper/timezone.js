const moment = require('moment-timezone');

exports.searchZone = function(zone) {
    var matches = [];
    var exact = '';
    if (zone.length >= 3)
        moment.tz.names().forEach(function (val) {
            if (val.toLowerCase() == zone.toLowerCase())
                exact = val;

            if (val.toLowerCase().indexOf(zone.toLowerCase()) >= 0)
                matches.push(val);
        });

    if (exact.length > 1)
        matches = [exact];

    return matches;
}
