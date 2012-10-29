var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function MXR(name, ttl, pref, exchange) {
    MXR.super_.call(this, name, ttl);
    this.setType(15);
    this.setRdata(pref, exchange);
}

util.inherits(MXR, RR);

MXR.prototype.setRdata = function (pref, exchange) {
    name = this._domainToName(exchange);
    this._rdata = new Buffer(2 + name.length);

    this._rdata.writeUInt16BE(pref, 0);
    name.copy(this._rdata, 2, 0, name.length);
}

module.exports = MXR;
