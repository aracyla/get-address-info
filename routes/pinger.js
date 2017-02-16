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
    return geo;
}

/*
address = {ip: value, hostname: value}
*/
var pinger_exe = function (address, res){
    res.writeHead(200, {"Content-type": 'application/json'});
    console.log("=>pinger mainApp:");
    console.log("=>Ip: "+address.ip);
    console.log("=>Hostname: "+address.hostname);
//CHECK IF IS ALIVE

    isHostAlive((address.ip)?address.ip:address.hostname, function(isAlive){
        console.log("isAlive: "+isAlive);
        if(isAlive){
            //if alive mount jsonresponse
            mount_JSONResponse(address, res);
        }
        else{
            res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
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
            var JSON_georesponse = {};

            JSON_response["reverse_ip"] = hostnames;

            var geo = getIpInformation(address.ip);

            JSON_georesponse["country"] = geo.country;
            JSON_georesponse["state"] = geo.region;
            JSON_georesponse["city"] = geo.city;
            JSON_georesponse["lat"] = geo.ll[0];
            JSON_georesponse["lon"] = geo.ll[1];

            JSON_response["geo"] = JSON_georesponse;
            console.log(JSON_response);
            res.end(JSON.stringify(JSON_response));
        });
    }else{

        hostnameToIp(address.hostname, function(ip, family){
            JSON_response["ip"] = ip;
            ipToHostnames(ip, function(hostnames){
                var JSON_georesponse = {};

                JSON_response["reverse_ip"] = hostnames;

                var geo = getIpInformation(ip);
                JSON_georesponse["country"] = geo.country;
                JSON_georesponse["state"] = geo.region;
                JSON_georesponse["city"] = geo.city;
                JSON_georesponse["lat"] = geo.ll[0];
                JSON_georesponse["lon"] = geo.ll[1];

                JSON_response["geo"] = JSON_georesponse;
                console.log(JSON_response);
                res.end(JSON.stringify(JSON_response));
            });


        });
    }

}


var Pinger = module.exports = {};

Pinger.mainApp = pinger_exe;
