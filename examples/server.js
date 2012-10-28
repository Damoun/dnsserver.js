#!/usr/bin/env node

var util = require('util'),
dnsserver = require('../lib/dnsserver'),
AR = require('../lib/AR'),
MXR = require('../lib/MXR'),
NSR = require('../lib/NSR');

var server = dnsserver.createServer();
server.bind(8000, '127.0.0.1');

var nameList = [];
nameList.push(new AR('tomhughescroucher.com.', '184.106.231.91'));
nameList.push(new AR('tomhughescroucher.com.', '127.0.0.1'));
nameList.push(new NSR('tomhughescroucher.com.', 'eforward3.registrar-servers.com.'));

server.on('request', function(req, res) {
    // console.log("req = ", req);

    for (var i = 0; i < nameList.length; ++i) {
	if (nameList[i].getClass() == req.question.qclass
	    && nameList[i].getType() == req.question.qtype
	    && nameList[i].getName().toString() == req.question.qname.toString()) {
	    res.addRR(nameList[i].getName(),
		      nameList[i].getClass(),
		      nameList[i].getType(),
		      nameList[i].getTtl(),
		      nameList[i].getRdlength(),
		      nameList[i].getRdata());
	}
    }

    res.send();
});

server.on('error', function(e) {
    throw e;
});
