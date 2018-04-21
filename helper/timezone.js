const moment = require('moment-timezone');

exports.searchZone = function (zone) {
    var z = zone.toLowerCase();

    // We probably want US EST, not the non-DST obeying EST (used in some islands near the equator)
    if (z == 'est')
        return ['EST5EDT'];

    var matches = [];
    var exact = '';
    if (zone.length >= 3)
        moment.tz.names().forEach(function (val) {
            if (val.toLowerCase() == zone.z)
                exact = val;

            if (val.toLowerCase().indexOf(zone.toLowerCase()) >= 0)
                matches.push(val);
        });

    if (exact.length > 1)
        matches = [exact];

    return matches;
}
