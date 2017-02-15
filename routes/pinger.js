ping = require('ping');
var geoip = require('geoip-lite');
const dns = require('dns');



var pinger = function (host, f_cb){
    ping.sys.probe(host, function(isAlive, err){
        f_cb(isAlive);
    });
}

var ipToHostnames = function (address, f_cb){
    dns.reverse(address, function(err, hostnames){
        if(!err)
            f_cb(hostnames);
    });
}

var hostnameToIp = function (hostname, f_cb){
    dns.lookup(hostname, function(err, address, family){
        if(!err)
            f_cb(address, family);
    });
}

var getIpInformation = function (address){
    var geo = geoip.lookup(address);
    console.log(geo);
}

var getHostnameInformation = function (hostname){
    hostnameToIp(hostname, function(address, family){
        getIpInformation(address);
    });
}


var App = module.exports = {};

App.getIpInfo = getHostnameInformation;
App.getHosnameFromIp = ipToHostnames;
App.getIpFromHostname = hostnameToIp;
App.isHostAlive = pinger;
