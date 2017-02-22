var connect = require('connect');
var http = require('http');
var url = require("url");
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var Pinger = require('./routes/pinger');

var app = connect();

var server = function (req, res){
    switch (req.url) {
        case "/favicon.ico":
        break;

        case "/":
            HTTP_SendFile(res, req, "public/pinger");
        break;

        case "/pinger":
            console.log("=>pinger route");

            if(req.method == 'POST'){
                var body = "";
                req.on('data', function (data) {
                    body += data;
                });
                req.on("end", function(){
                    var post = qs.parse(body);
                    Pinger.mainApp(post, res);
                });

            }
        break;

        case "/pageload":
            var address = {"ip": getClientIp(req), "hostname": ""};
            Pinger.mainApp(address, res);
        break;

        //invalid routes will fall here and be ignored by sendfile function
        default:
            HTTP_SendFile(res, req, "public/pinger");
        break;

    }
}

function HTTP_SendFile(res, req, basename){
    var filepath;
    if(!path.extname(req.url)) filepath = basename+".html";
    else filepath = basename+path.extname(req.url);

    switch (path.extname(req.url)) {
            case ".css":
                res.writeHead(200, {"Content-type": "text/css"});
                fs.createReadStream(filepath).pipe(res);
            break;

            default:
                res.writeHead(200, {"Content-type": "text/html"});
                fs.createReadStream(filepath).pipe(res);

            break;

        }

}

function getClientIp(req){
    var ipAddr = req.headers["x-forwarded-for"];
    if (ipAddr){
        var list = ipAddr.split(",");
        ipAddr = list[list.length-1];
    } else {
        ipAddr = req.connection.remoteAddress;
    }
    rm = ipAddr.lastIndexOf(':');
    if(!rm) return null;

    return ipAddr.slice(rm+1, ipAddr.length);
}
/*
function stripIp(ipAddr){
    var ip_pattern = /\d\d\d.\d\d\d.\d\d\d.\d\d\d/i;
    rm = str.match(http_pattern);
    if(!rm) return str;
    return (str.slice(rm[0].length, str.length));
}*/


app.use('/', server);

var port = (process.env.PORT || 5000);

http.createServer(app).listen(port);
console.log('Server is running...');


//FIXME:check if address exists
//TODO:add this code to appjs module
//TODO:organize route and public folders
