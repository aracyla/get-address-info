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


var pinger_exe = function (address, res, fcb_EndResponse){
    res.writeHead(200, {"Content-type": 'application/json'});

//CHECK IF IS ALIVE
    isHostAlive((address.ip)?address.ip:address.hostname, function(isAlive){
        if(isAlive){
            //FIXME:add a function to mount and handle all response jsons
            res.write(JSON.stringify({isAlive: true}));
            res.end();
        }
        else{
            res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hoshostname:false, "ip": address.ip?address.ip:false}));
            res.end();
        }

    });
}


var Pinger = module.exports = {};

Pinger.mainApp = pinger_exe;
