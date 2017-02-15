ping = require('ping');
var geoip = require('geoip-lite');
const dns = require('dns');



var isHostAlive = function (host, f_cb){
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

/*
address = {ip: value, hostname: value}
*/
var pinger_exe = function (address, res){
    res.writeHead(200, {"Content-type": 'application/json'});

//CHECK IF IS ALIVE
    isHostAlive((address.ip)?address.ip:address.hostname, function(isAlive){
        if(isAlive){
            //if alive mount jsonresponse
            mount_JSONResponse(address, res);
        }
        else{
            res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hoshostname:false, "ip": address.ip?address.ip:false}));
            res.end();
        }
    });
}

function mount_JSONResponse(address, res){

    var JSON_response = {};
    JSON_response["isAlive"] = true;
    //res.write(JSON.stringify({isAlive: true}));
    if(address.ip){
        JSON_response["ip"] = address.ip;
        ipToHostnames(address.ip, function(hostnames){
            JSON_response["reverse_ip"] = hostnames;

            res.end(JSON.stringify(JSON_response));
        });
    }else{

        hostnameToIp(address.hostname, function(ip, family){
            JSON_response["ip"] = ip;
            ipToHostnames(ip, function(hostnames){
                console.log(hostnames);
                JSON_response["reverse_Ip"] = hostnames;
                res.end(JSON.stringify(JSON_response));
            });


        });
    }

}


var Pinger = module.exports = {};

Pinger.mainApp = pinger_exe;
