var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function AR(name, ip) {
    AR.super_.call(this);
    this.setType(1);
    this.setRdlength(4);
    this.setName(name);
    this.setRdata(ip);
}

util.inherits(AR, RR);

AR.prototype.setRdata = function (ip) {
    var d = ip.split(".");
    this._rdata = new Buffer(4);

    this._rdata.writeUInt32BE(((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]), 0);
}

module.exports = AR;
