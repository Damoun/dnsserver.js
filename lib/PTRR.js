var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function PTRR(name, ttl, domain) {
    PTRR.super_.call(this, name, ttl);
    this.setType(5);
    this.setRdata(domain);
}

util.inherits(PTRR, RR);

PTRR.prototype.setRdata = function (domain) {
    this._rdata = this._domainToName(domain);
}

module.exports = PTRR;
