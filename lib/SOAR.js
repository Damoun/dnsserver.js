var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function SOAR(name, ttl, mdomain, rdomain, serial, refresh, retry, expire, minimum) {
    SOAR.super_.call(this, name, ttl);
    this.setType(6);
    this.setRdata(mdomain, rdomain, serial, refresh, retry, expire, minimum);
}

util.inherits(SOAR, RR);

SOAR.prototype.setRdata = function (mdomain, rdomain, serial, refresh, retry, expire, minimum) {
    mname = this._domainToName(mdomain);
    rname = this._domainToName(rdomain);
    this._rdata = new Buffer(mname.length + rname.length + 20);

    mname.copy(this._rdata);
    rname.copy(this._rdata, mname.length);

    this._rdata.writeUInt32BE(serial, mname.length + rname.length);
    this._rdata.writeInt32BE(refresh, mname.length + rname.length + 4);
    this._rdata.writeInt32BE(retry, mname.length + rname.length + 8);
    this._rdata.writeInt32BE(expire, mname.length + rname.length + 12);
    this._rdata.writeInt32BE(minimum, mname.length + rname.length + 16);
}

module.exports = SOAR;
