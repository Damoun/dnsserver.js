var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function AR(name, ttl, ip) {
    AR.super_.call(this, name, ttl);
    this.setType(1);
    this.setRdata(ip);
}

util.inherits(AR, RR);

AR.prototype.setRdata = function (ip) {
    var d = ip.split(".");
    this._rdata = new Buffer(4);

    this._rdata.writeUInt32BE(((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]), 0);
}

module.exports = AR;
