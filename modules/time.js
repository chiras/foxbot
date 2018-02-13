const moment = require('moment-timezone');
require('datejs');
const mh = require("../helper/messages.js")
const zone = require("../helper/timezone.js");


module.exports = (bot, msg, options, Discord) => {
    var embed = mh.prepare(Discord)

    if (options.options == "-help" || options.others.length == 0) {
        embed.setTitle("Options for " + options.command)
        //embed.addField(options.command, "Shows timezone conversions")
        embed.addField(options.command + " EST", "Will show the current time for US EST")
        embed.addField(options.command + " 6am EST in UTC", "Converts a time from EST to UTC")
    } else {
        var dest = zone.searchZone(options.others.pop());

        if (dest.length != 1)
            return; // TODO: Error

        if (options.others.length == 0) {
            // Single conversion
            let tz = moment().tz(dest[0]);
            embed.addField("Time in " + tz.zoneName(), "It is currently " + tz.format('h:mm a z'));
        }
        else {
            var query = options.others.join(" ");
            var src = zone.searchZone(options.others.pop());
            if (src.length == 0 && options.others.length > 0)
                src = zone.searchZone(options.others.pop());    // Assume that the word was a 'joiner' (ie, 'to' 'in' etc)

            if (src.length != 0 && options.timezone.length > 0) {
                // Ignore both non-match and multiple matches and prefer fallback to 'option' timezone
                options.others = [query];
                src = dest;
                dest = [options.timezone];
            }

            // Could probably do other smarts here too, eg detect a 'hh:mmZ-00:00' or equivalent

            if (src.length != 1) {
                // TODO: Error
                return;
            }

            query = options.others.join(" ");
            var parsed = Date.parse(query);
            if (parsed != null) {
                var tz = moment.tz(parsed.toString("yyyy-MM-ddTHH:mm:ss"), src[0]);
                embed.addField("Conversion to " + dest[0], tz.format("ddd h:mm a z") + " converts to " + tz.tz(dest[0]).format("ddd h:mm a z"));
            }
            else
                return;
        }

    }

    mh.send(msg, embed, options)

};
