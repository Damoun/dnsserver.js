#!/usr/bin/env node

var util = require('util'),
dnsserver = require('../lib/dnsserver'),
AR = require('../lib/AR'),
MXR = require('../lib/MXR'),
NSR = require('../lib/NSR'),
SOAR = require('../lib/SOAR');

var server = dnsserver.createServer();
server.bind(8000, '127.0.0.1');

var nameList = [];
nameList.push(new AR('google.com.', 1800, '173.194.34.0'));
nameList.push(new AR('google.com.', 1800, '173.194.34.6'));
nameList.push(new AR('google.com.', 1800, '173.194.34.3'));
nameList.push(new AR('google.com.', 1800, '173.194.34.5'));
nameList.push(new AR('google.com.', 1800, '173.194.34.8'));
nameList.push(new AR('google.com.', 1800, '173.194.34.2'));
nameList.push(new AR('google.com.', 1800, '173.194.34.9'));
nameList.push(new AR('google.com.', 1800, '173.194.34.14'));
nameList.push(new AR('google.com.', 1800, '173.194.34.1'));
nameList.push(new AR('google.com.', 1800, '173.194.34.7'));
nameList.push(new AR('google.com.', 1800, '173.194.34.4'));

nameList.push(new NSR('google.com.', 1800, 'ns1.google.com.'));
nameList.push(new NSR('google.com.', 1800, 'ns2.google.com.'));
nameList.push(new NSR('google.com.', 1800, 'ns3.google.com.'));
nameList.push(new NSR('google.com.', 1800, 'ns4.google.com.'));

nameList.push(new MXR('google.com.', 1800, 10, 'aspmx.l.google.com.'));
nameList.push(new MXR('google.com.', 1800, 20, 'alt1.aspmx.l.google.com.'));
nameList.push(new MXR('google.com.', 1800, 30, 'alt2.aspmx.l.google.com.'));
nameList.push(new MXR('google.com.', 1800, 40, 'alt3.aspmx.l.google.com.'));
nameList.push(new MXR('google.com.', 1800, 50, 'alt4.aspmx.l.google.com.'));

nameList.push(new SOAR('google.com.', 1800, 'ns1.google.com.', 'dns-admin.google.com.', 2012101500, 7200, 1800, 1209600, 300));

server.on('request', function(req, res) {
    console.log("req = ", req);

    for (var i = 0; i < nameList.length; ++i) {
	if (nameList[i].getClass() == req.question.qclass
	    && nameList[i].getType() == req.question.qtype
	    && nameList[i].getName().toString() == req.question.qname.toString()) {
	    res.addRR(nameList[i]);
	}
    }

    res.send();
});

server.on('error', function(e) {
    throw e;
});
