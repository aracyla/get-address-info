var geoip = require('geoip-lite');
var dns = require('dns');
var http = require('http');

const TIMEOUT = 6000;

const DNS_PUBLIC_TABLE = ["8.8.8.8", "8.8.4.4"];

var isHostAlive = function (host_ip, f_cb){
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


var hostnameToIp = function (hostname, f_cb){
    dns.lookup(hostname, function(err, address, family){
        if(!err)
            f_cb(address, family);
        else
            f_cb(null, null);
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

//CHECK IF ITS AN IP INFO REQUEST
    if(address.ip){
        address.ip = (stripHTTP(address.ip));

        isHostAlive(address.ip, function(isAlive){
            console.log("------isAlive(httpget): "+isAlive);
            //IF ALIVE MOUNT RESPONSE
            if(isAlive){
                mount_JSONResponse(address, res);
            }
            //NOT SURE IF ITS ALIVE
            else{
                //TRY TO GET GEO INFO
                JSON_georesponse = mount_JSONGeoResponse(address.ip);
                //NOT FOUNG GEO INFO - MOUNT NOT FOUND RESPONSE
                if(!JSON_georesponse){
                    console.log(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
                    res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
                    res.end();
                }
                //MOUN ONLY JSON FOR GEO RESPONSE AND UNDEF STATUS
                else {
                    var JSON_response = {};
                    JSON_response["isAlive"] = "undefined";
                    JSON_response["ip"] = address.ip;
                    JSON_response["geo"] = JSON_georesponse;
                    res.write(JSON.stringify(JSON_response));
                    res.end();
                }
            }
        });
    }
    //A HOSTNAME INFO REQUEST
    else{
        address.hostname = (stripHTTP(address.hostname));
        //'CONVERT' HOSTNAME TO IP
        hostnameToIp(address.hostname, function(ip, family){
            //IF A VALID IP
            if(ip) {
                isHostAlive(ip, function(isAlive){
                    console.log("isAlive: "+isAlive);
                    //CHECK IF IP IS ALIVE AND IF TRUE MOUNT JSONRESPONSE
                    if(isAlive){
                        mount_JSONResponse(address, res);
                    }
                    //IP IS NOT ALIVE - MOUNT NOT FOUND RESPONSE
                    else{
                        res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
                        res.end();
                    }
                });
            }
            //NON VALID IP
            else {
                //MOUNT NOT FOUND RESPONSE
                res.write(JSON.stringify({isAlive: false ,"hostname": address.hostname?address.hostname:false, "ip": address.ip?address.ip:false}));
                res.end();
            }
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
        JSON_response["geo"] = mount_JSONGeoResponse(address.ip);
        res.end(JSON.stringify(JSON_response));
    }
    else{
        hostnameToIp(address.hostname, function(ip, family){
            console.log("------JSON_ip: "+ip);
            JSON_response["ip"] = ip;
            JSON_response["geo"] = mount_JSONGeoResponse(ip);
            res.end(JSON.stringify(JSON_response));
        });
    }
}
function mount_JSONGeoResponse(ip) {
    var JSON_georesponse = {};

    var geo = getIpInformation(ip);
    if(!geo) return null;
    JSON_georesponse["country"] = geo.country;
    JSON_georesponse["state"] = geo.region;
    JSON_georesponse["city"] = geo.city;
    JSON_georesponse["lat"] = geo.ll[0];
    JSON_georesponse["lon"] = geo.ll[1];

    return JSON_georesponse;
}



function stripHTTP(str){
    var http_pattern = /http:\/\//i;
    rm = str.match(http_pattern);
    if(!rm) return str;
    return (str.slice(rm[0].length, str.length));
}


function validateHostname(hostname){
    var pattern_hostname = /_(^|[\s.:;?\-\]<\(])(https?://[-\w;/?:@&=+$\|\_.!~*\|'()\[\]%#,☺]+[\w/#](\(\))?)(?=$|[\s',\|\(\).:;?\-\[\]>\)])_i/g;

    rm = hostname.match(pattern_hostname);
    if(!rm) return false;
    return true;
}

function validateIp(ip) {
    return is_ip(ip);
}


var Pinger = module.exports = {};

Pinger.mainApp = pinger_exe;
