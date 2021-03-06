// Copyright (c) 2010 Tom Hughes-Croucher
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var util = require('util'),
Buffer = require('buffer').Buffer,
dgram = require('dgram'),
RR = require('./RR.js');

function Server() {
    dgram.Socket.call(this, 'udp4');

    var self = this;
    this.on('message', function(msg, rinfo) {
//	try {
	    //split up the message into the dns request header info and the query
	    var request = processRequest(msg);
	    var response = new Response(self, rinfo, request);
	    this.emit('request', request, response);
//	} catch (err) {
//	}
    });
}

exports.Server = Server;
util.inherits(exports.Server, dgram.Socket);
exports.createServer = function() {
    return new Server();
}

//takes a buffer as a request
var processRequest = exports.processRequest = function(req) {
    //see rfc1035 for more details
    //http://tools.ietf.org/html/rfc1035#section-4.1.1

    var query = {};
    query.header = {};
    query.question = {};

    //transaction id
    // 2 bytes
    query.header.id = req.readUInt16BE(0);

    //qr
    // 1 bit
    query.header.qr = req[2] >> 7 & 0x1;
    //opcode
    // 0 = standard, 1 = inverse, 2 = server status, 3-15 reserved
    // 4 bits
    query.header.opcode = req[2] >> 3 & 0xf;
    //authorative answer
    // 1 bit
    query.header.aa = req[2] >> 2 & 0x1;
    //truncated
    // 1 bit
    query.header.tc = req[2] >> 1 & 0x1;
    //recursion desired
    // 1 bit
    query.header.rd = req[2] & 0x1;

    //recursion available
    // 1 bit
    query.header.ra = req[3] >> 7 & 0x1;

    //reserved 3 bits
    // rfc says always 0
    query.header.z = req[3] >> 4 & 0x7;

    //response code
    // 0 = no error, 1 = format error, 2 = server failure
    // 3 = name error, 4 = not implemented, 5 = refused
    // 6-15 reserved
    // 4 bits
    query.header.rcode = req[3] & 0xf;

    //question count
    // 2 bytes
    query.header.qdcount = req.readUInt16BE(4);
    //answer count
    // 2 bytes
    query.header.ancount = req.readUInt16BE(6);
    //ns count
    // 2 bytes
    query.header.nscount = req.readUInt16BE(8);
    //addition resources count
    // 2 bytes
    query.header.arcount = req.readUInt16BE(10);

    // read only the first question
    if (query.header.qdcount > 0) {
	query.question.qname = req.slice(12, req.length - 4);
	// qtype
	// 2 bytes
	query.question.qtype = req.readUInt16BE(req.length - 4);
	// qclass
	// 2 bytes
	query.question.qclass = req.readUInt16BE(req.length - 2);
    }

    return query;
}

function Response(socket, rinfo, query) {
    this.socket = socket;
    this.rinfo = rinfo;
    this.header = {};

    //1 byte
    this.header.id = query.header.id; //same as query id

    //combined 1 byte
    this.header.qr = 1; //this is a response
    this.header.opcode = 0; //standard for now TODO: add other types 4-bit!
    this.header.aa = 0; // authority
    this.header.tc = 0; // truncation
    this.header.rd = 1; // recursion asked for

    //combined 1 byte
    this.header.ra = 0; //no rescursion here TODO
    this.header.z = 0; // spec says this MUST always be 0. 3bit
    this.header.rcode = 0; //TODO add error codes 4 bit.

    //1 byte
    this.header.qdcount = 1; //1 question
    //1 byte
    this.header.ancount = 0; //number of rrs returned from query
    //1 byte
    this.header.nscount = 0;
    //1 byte
    this.header.arcount = 0;

    this.question = {};
    this.question.qname = query.question.qname;
    this.question.qtype = query.question.qtype;
    this.question.qclass = query.question.qclass;

    this.question.length = 0;

    this.rr = [];
}

Response.prototype.addRR = function(r) {
    if (r instanceof RR == false)
	throw new Error('addRR accept only RR Object');

    this.rr.push(r);

    this.question.length += r.getRdlength() + r.getName().length;
    ++this.header.ancount;
}

Response.prototype.send = function(callback) {
    if (this.rr.length == 0)
	this.rcode = 3;

    var buffer = this.toBuffer();
    this.socket.send(buffer, 0, buffer.length, this.rinfo.port, this.rinfo.address, callback || function() {});
}

Response.prototype.toBuffer = function() {
    var len = 16 + this.question.qname.length + this.question.length + 10 * this.rr.length;
    var buf = new Buffer(len);

    buf.writeUInt16BE(this.header.id, 0);

    buf[2] = this.header.qr << 7 | this.header.opcode << 3 | this.header.aa << 2 | this.header.tc << 1 | this.header.rd;

    buf[3] = this.header.ra << 7 | this.header.z << 4 | this.header.rcode;

    buf.writeUInt16BE(this.header.qdcount, 4);

    buf.writeUInt16BE(this.header.ancount, 6);
    buf.writeUInt16BE(this.header.nscount, 8);
    buf.writeUInt16BE(this.header.arcount, 10);

    //end header

    this.question.qname.copy(buf, 12, 0, this.question.qname.length);

    buf.writeUInt16BE(this.question.qtype, 12 + this.question.qname.length);
    buf.writeUInt16BE(this.question.qclass, 14 + this.question.qname.length);

    var rrStart = 16 + this.question.qname.length;

    for (var i = 0; i < this.rr.length; ++i) {
	this.rr[i].getName().copy(buf, rrStart, 0, this.rr[i].getName().length);

	buf.writeUInt16BE(this.rr[i].getType(), rrStart + this.rr[i].getName().length);
	buf.writeUInt16BE(this.rr[i].getClass(), rrStart + this.rr[i].getName().length + 2);
	buf.writeUInt32BE(this.rr[i].getTtl(), rrStart + this.rr[i].getName().length + 4);
	buf.writeUInt16BE(this.rr[i].getRdlength(), rrStart + this.rr[i].getName().length + 8);

	this.rr[i].getRdata().copy(buf, rrStart + this.rr[i].getName().length + 10, 0, this.rr[i].getRdlength());

	rrStart += this.rr[i].getName().length + 10 + this.rr[i].getRdlength();
    }

    //TODO compression

    return buf;
}
