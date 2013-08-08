var http = require('http'),
    url = require('url'),
    path = require('path'),
    Readfiles = require('./lib/readfile');

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

            if(req.url === '/favicon.ico'){
                res.end();
                return;
            }
            var urlObj = url.parse(req.url, true), // 获取被代理的 URL
                pathName = urlObj.path.replace(/([^?])\?[^?]*$/, "$1").replace(/\?$/, "");

            if(pathName.indexOf("??") == -1){ //非combo
                that._proxySingle(pathName, res);
            } else{
                that._proxyCombo(pathName, res);
            }

        }).listen(that.config.localPort || 80);
    },
    _getfileExt: function(ext){
        if(!ext) return;
        var type = '';
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
        return type;
    },
    _proxySingle: function(pathName, res){
        var ext = path.extname(pathName),
            config = this.config,
            type = this._getfileExt(ext);

        new Readfiles({
            localPrefix: config.localPrefix,
            onlineHost: config.onlineHost,
            onlinePrefix: config.onlinePrefix,
            success: function(data){
                res.writeHead(200, {
                    'Content-Type': 'text/' + type + ';charset=utf-8'
                });
                res.end(data);
            },
            paths: pathName
        }).read();

    },

    _proxyCombo: function(pathName, res){
        var config = this.config,
            pathArr = pathName.split("??"),
            fileList = pathArr[1].split(","),
            ext = path.extname(fileList[0]),
            type = this._getfileExt(ext);

        console.log(fileList)

        new Readfiles({
            localPrefix: config.localPrefix,
            onlineHost: config.onlineHost,
            onlinePrefix: config.onlinePrefix,
            success:function(data){
                res.writeHead(200, {
                    'Content-Type': 'text/'+type
                });
                res.end(data);
            },
            paths:fileList
        }).read();
    }

}

module.exports = Comboproxy;