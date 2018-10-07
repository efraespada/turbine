'use strict';

var os = require('os');

function Ip() {

    this.ip = () => {
        let i = "";
        var ifaces = os.networkInterfaces();
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                i = iface.address;
                ++alias;
            });
        });
        return i;
    };
}

module.exports = Ip;