var geoip = require('geoip-lite');
var dns = require('dns');
var http = require('http');

const TIMEOUT = 6000;

const DNS_PUBLIC_TABLE = ["8.8.8.8", "8.8.4.4"];

var isHostAlive = function (host_ip, f_cb){
    /*
    tcpp.ping({ address: host_ip, attempts: 1, timeout: 4000 }, function(err, data) {
        if(data.max)
            f_cb(true);
        else
            f_cb(false);
    });

    ping.sys.probe(host_ip, function(isAlive){
        f_cb(isAlive);
    })*/
    if(DNS_PUBLIC_TABLE.find(function (ip_dns_pub){
        return (ip_dns_pub == host_ip);
    })){
        f_cb(true);
        return ;
    }

    var req = http.get({host: host_ip}, function(c){
        console.log(c.statusCode);
        f_cb(true);
    }).on('error', function(e){
        f_cb(false);
    });

    req.setTimeout(TIMEOUT, function(){
        req.abort();
    });

}
/* Working on it!
var reverseIp = function (address, f_cb){
    dns.reverse(address, function(err, hostnames){
        if(!err){
            f_cb(hostnames);
        }else{
            console.log(err);
        }
    });
}
*/

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
    console.log("------Ip: "+address.ip);
    console.log("------Hostname: "+address.hostname);
//CHECK IF IS ALIVE
    if(address.ip){
        address.ip = (stripHTTP(address.ip));

        isHostAlive(address.ip, function(isAlive){
            console.log("------isAlive: "+isAlive);
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
    else{
        address.hostname = (stripHTTP(address.hostname));

        hostnameToIp(address.hostname, function(ip, family){
            isHostAlive(ip, function(isAlive){
                console.log("isAlive: "+isAlive);
                if(isAlive){
                    mount_JSONResponse(address, res);
                }
                else{
                    res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
                    res.end();
                }
            });
        });
    }
}

function mount_JSONResponse(address, res){

    var JSON_response = {};
    JSON_response["isAlive"] = true;
    //res.write(JSON.stringify({isAlive: true}));
    console.log("=>pinger mountingJsonResponse: ");
    if(address.ip){
        console.log("------JSON_ip: "+address.ip);
        JSON_response["ip"] = address.ip;

        var JSON_georesponse = {};


        //console.log(JSON_response);
        var geo = getIpInformation(address.ip);

        JSON_georesponse["country"] = geo.country;
        JSON_georesponse["state"] = geo.region;
        JSON_georesponse["city"] = geo.city;
        JSON_georesponse["lat"] = geo.ll[0];
        JSON_georesponse["lon"] = geo.ll[1];

        JSON_response["geo"] = JSON_georesponse;

        res.end(JSON.stringify(JSON_response));

    }else{

        hostnameToIp(address.hostname, function(ip, family){

            console.log("------JSON_ip: "+ip);
            JSON_response["ip"] = ip;

            var JSON_georesponse = {};


            //console.log(JSON_response);
            var geo = getIpInformation(ip);
            JSON_georesponse["country"] = geo.country;
            JSON_georesponse["state"] = geo.region;
            JSON_georesponse["city"] = geo.city;
            JSON_georesponse["lat"] = geo.ll[0];
            JSON_georesponse["lon"] = geo.ll[1];

            JSON_response["geo"] = JSON_georesponse;

            res.end(JSON.stringify(JSON_response));
        });
    }

}

function stripHTTP(str){
    var http_pattern = /http:\/\//i;
    rm = str.match(http_pattern);
    if(!rm) return str;
    return (str.slice(rm[0].length, str.length));
}



var Pinger = module.exports = {};

Pinger.mainApp = pinger_exe;


//TODO: add an axception for local ips(dns). Use geo ip directly
