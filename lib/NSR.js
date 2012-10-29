var util = require('util'),
RR = require('./RR.js');

function NSR(name, ttl, domain) {
    NSR.super_.call(this, name, ttl);
    this.setType(2);
    this.setRdata(domain);
}

util.inherits(NSR, RR);

NSR.prototype.setRdata = function (domain) {
    this._rdata = this._domainToName(domain);
}

module.exports = NSR;
