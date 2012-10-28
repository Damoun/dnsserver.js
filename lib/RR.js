var Buffer = require('buffer').Buffer;

function RR() {
    this._name;
    this._type;
    this._class = 1; // IN
    this._ttl = 1;
    this._rdlength;
    this._rdata;
}

RR.prototype.getName = function ()     { return this._name; }
RR.prototype.getType = function ()     { return this._type; }
RR.prototype.getClass = function ()    { return this._class; }
RR.prototype.getTtl = function ()      { return this._ttl; }
RR.prototype.getRdlength = function () { return this._rdlength; }
RR.prototype.getRdata = function ()    { return this._rdata; }

RR.prototype.setType = function (type)         { this._type = type; }
RR.prototype.setClass = function (klass)       { this._class = klass; }
RR.prototype.setTtl = function (ttl)           { this._ttl = ttl; }
RR.prototype.setRdlength = function (rdlength) { this._rdlength = rdlength; }
RR.prototype.setRdata = function (rdata)       { this._rdata = rdata; }

RR.prototype.setName = function (name) {
    var labels = name.split(".");
    this._name = new Buffer(name.length + 1);
    var offset = 0;

    for (var i = 0; i < labels.length && labels[i].length != 0; ++i) {
	this._name.writeUInt8(labels[i].length, offset);
	++offset;
	this._name.write(labels[i], offset);
	offset += labels[i].length;
    }
    this._name.writeUInt8(0, offset);
}

module.exports = RR;
