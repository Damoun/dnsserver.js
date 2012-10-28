var util = require('util'),
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
    var parts = ip.split(".");

    this._rdata = parseInt(parts[0], 10) << 24;
    this._rdata += parseInt(parts[1], 10) << 16;
    this._rdata += parseInt(parts[2], 10) << 8;
    this._rdata += parseInt(parts[3], 10);
}

module.exports = AR;