var util = require('util'),
Buffer = require('buffer').Buffer,
RR = require('./RR.js');

function CNAMER(name, ttl, domain) {
    CNAMER.super_.call(this, name, ttl);
    this.setType(5);
    this.setRdata(domain);
}

util.inherits(CNAMER, RR);

CNAMER.prototype.setRdata = function (domain) {
    this._rdata = this._domainToName(domain);
}

module.exports = CNAMER;
