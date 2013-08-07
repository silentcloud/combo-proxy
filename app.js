var http = require('http'),
    url = require('url'),
    path = require('path'),
    Readfile = require('./lib/readfile');

function Comboproxy(config){
    this.config = config;
}

Comboproxy.prototype = {
    init: function(){
        this._createServer();
    },

    _createServer: function(){
        var that = this;
        http.createServer(function(req, res){
            res.writeHead(200);

            if(req.url === '/favicon.ico'){
                res.end();
                return;
            }
            var urlObj = url.parse(req.url, true), // 获取被代理的 URL
                pathName = urlObj.path.replace(/([^?])\?[^?]*$/, "$1").replace(/\?$/, "");

            if(pathName.indexOf("??") == -1){ //非combo
                that._proxySingle(pathName);
            } else{
                that._proxyCombo(pathName);
            }

            res.end('haha');

        }).listen(that.config.localPort || 80);
    },

    _proxySingle: function(pathName){
        var ext = path.extname(pathName), type = '', config = this.config;

        switch(ext){
            case '.js':
                type = 'javascript';
                break;
            case '.css':
                type = 'css';
                break;
            default:
                type = 'plain';
                break;
        }

        new Readfile({
            localPrefix: config.localPrefix,
            onlineHost: config.onlineHost,
            onlinePrefix: config.onlinePrefix,
            success: function(data){
                res.writeHead(200, {
                    'Content-Type': 'text/' + type
                });
                res.end(data);
            },
            paths: pathName
        }).read();

    },

    _proxyCombo: function(pathName){

    }

}

module.exports = Comboproxy;