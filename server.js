var connect = require('connect');
var http = require('http');
var url = require("url");
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var pinger = require('./routes/pinger');

var app = connect();

var server = function (req, res){
    console.log(req.url);
    switch (req.url) {
        case "/favicon.ico":
            console.log("favicon request...");
            //res.end();
        break;

        case "/":
            HTTP_SendFile(res, req, "routes/pinger");
        break;

        case "/pinger":
            if(req.method == 'POST'){
                var body = "";
                req.on('data', function (data) {
                    body += data;
                });
                req.on("end", function(){
                    var post = qs.parse(body);
                    pinger_exe(post, res);
                });

            }
        break;

        //invalid routes will fall here and be ignored by sendfile function
        default:
            HTTP_SendFile(res, req, "routes/pinger");
        break;

    }

    //page template

    //if(path.extname(req.url) != "ico")


}

function HTTP_SendFile(res, req, basename){
    var filepath;
    if(!path.extname(req.url)) filepath = basename+".html";
    else filepath = basename+path.extname(req.url);

    switch (path.extname(req.url)) {
            case ".css":
                res.writeHead(200, {"Content-type": "text/css"});
                fs.createReadStream("app.css").pipe(res);
            break;

            default:
                res.writeHead(200, {"Content-type": "text/html"});
                fs.createReadStream("app.html").pipe(res);

            break;

        }

}


app.use('/', server);

http.createServer(app).listen(3000);
console.log('Server is running...');

//FIXME:check if address exists
function app_exe(address, res, fcb_EndResponse){
    res.writeHead(200, {"Content-type": 'application/json'});

//CHECK IF IS ALIVE
    app_js.isHostAlive((address.ip)?address.ip:address.hostname, function(isAlive){
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

//TODO:add this code to appjs module
//TODO:organize route and public folders
