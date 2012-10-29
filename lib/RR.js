var Buffer = require('buffer').Buffer;

function RR(name, ttl) {
    this.setName(name);
    this._type;
    this._class = 1; // IN
    this._ttl = ttl;
    this._rdata;
}

RR.prototype.getName = function ()     { return this._name; };
RR.prototype.getType = function ()     { return this._type; };
RR.prototype.getClass = function ()    { return this._class; };
RR.prototype.getTtl = function ()      { return this._ttl; };
RR.prototype.getRdlength = function () { return this._rdata.length; };
RR.prototype.getRdata = function ()    { return this._rdata; };

RR.prototype.setType = function (type)         { this._type = type; };
RR.prototype.setClass = function (klass)       { this._class = klass; };
RR.prototype.setTtl = function (ttl)           { this._ttl = ttl; };
RR.prototype.setRdata = function (rdata)       { this._rdata = rdata; };

RR.prototype._domainToName = function (domain) {
    var labels = domain.split(".");
    var offset = 0;
    var name = new Buffer(domain.length + 1);

    for (var i = 0; i < labels.length && labels[i].length != 0; ++i) {
	name.writeUInt8(labels[i].length, offset);
	++offset;
	name.write(labels[i], offset, labels[i].length);
	offset += labels[i].length;
    }
    name.writeUInt8(0, offset)

    return name;
};

RR.prototype.setName = function (name) {
    this._name = this._domainToName(name);
};

module.exports = RR;
