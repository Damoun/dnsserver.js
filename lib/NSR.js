var util = require('util'),
RR = require('./RR.js');

function NSR(name, domain) {
    NSR.super_.call(this);
    this.setName(name);
    this.setType(2);
    this.setRdata(this._domainToName(domain));
    this.setRdlength(this._rdata.length)
}

util.inherits(NSR, RR);

module.exports = NSR;
