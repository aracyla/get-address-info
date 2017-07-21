var connect = require('connect');
var http = require('http');
var url = require("url");
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var is_ip = require('is-ip');

var Pinger = require('./routes/pinger');

var app = connect();


var mainRoute_file = "pinger.html"

var server = function (req, res){
    switch (req.url) {
        case "/favicon.ico":
        break;

        case "/":
            HTTP_SendFile(res, req, "public/");
        break;

        case "/pinger":

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
            HTTP_SendFile(res, req, "public/");
        break;

    }
}

function HTTP_SendFile(res, req, basepath){
    var filepath;
    if(!path.extname(req.url)) filepath = basepath+mainRoute_file;
    else
        if(path.extname(req.url) == ".css")
            filepath = basepath+"temp/styles/style.css";

    //console.log(filepath);

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



app.use('/', server);

var port = (process.env.PORT || 5000);

http.createServer(app).listen(port);
console.log('Server is running...');
