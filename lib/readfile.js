var http = require('http'),
    fs   = require('fs'),
    path = require('path');

function Readfile(_config){
    var config = {
        paths: null,
        localPrefix: '',
        onlineHost: '',
        onlinePrefix: '',
        success: function(){

        }
    }
    this.config = mix(config, _config) ;
    if(typeof this.config.paths == 'string'){
        config.paths = [config.paths];
    }
    this.length = config.paths.length;
    this.result = '';
}

Readfile.prototype = {
    read: function(){
        var config = this.config, that = this;

        if(this.length <= 0){
            this.config.success.call(this, this.result);
            return;
        }
        this.length--;

        var pathName = config.paths[this.length],
            localPath = config.localPrefix + pathName ,
            onlinePath = config.onlinePrefix + pathName;

        fs.exists(localPath, function(exists){
            if(exists){
                that._getLocal(localPath);
            }else{
                that._getOnline(onlinePath);
            }
        })


    },
    _getLocal: function(localPath){
        var that = this;
        console.log('Get file from local >>' + localPath);
        fs.readFile(localPath, 'utf-8', function(err, data){
            if(err) throw err;
            console.log('Get local file success! >>' + localPath);
            that.result += data;
            that.read();
        });
    },
    _getOnline: function(onlinePath){
        var that = this;
        var options = {
            host: this.config.onlineHost,
            port: 80,
            path: onlinePath,
            method: 'GET'

        }
        console.log('Get file from online >>' + onlinePath);

        var req = http.request(options, function(res){
            var str = ""
            res.setEncoding('utf8');
            res.on('data', function(chunk){
                str += chunk;
            });
            res.on("end",function(){
                console.log("Get online file success! >>" + onlinePath);
                that.result += str;
                that.read();
            })
        });
        req.on('error', function(e){
            req.end('404 Not Found!');
            return false;
        });

        req.write("\n");
        req.end();
    }
}

module.exports = Readfile;

function mix(source, add){
    for(var i in add){
        source[i] = add[i];
    }
    return source;
}