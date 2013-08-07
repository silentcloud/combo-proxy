var http = require('http'),
    fs   = require('fs'),
    path = require('path');

function Readfile(config){
    this.config = config ;
}

module.exports = Readfile;

function mix(source, add){
    for(var i in add){
        source[i] = add[i];
    }
}