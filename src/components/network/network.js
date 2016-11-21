var Logger = require('../logger/logger');
var Promise = require('promise-polyfill');

/**
* Utility module for handling network functionalities
* @namespace Network
* @version 0.9
*/
var Network = new function(){

    var networkInstance = this;
    
    /**
    * performs an XMLHttpRequest
    * @function xhr
    * @memberof Network
    */
    this.xhr = function(method, url, data=null, headers=null){
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        
        if(headers){
            for(let key in headers){
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        
        let promise = new Promise(function(resolve, reject){
            xhr.onreadystatechange = function(){
                if ( xhr.readyState === 4 ) {
                    var resp = xhr;
                    resp.success = (xhr.status >= 200 && xhr.status <= 399);
                    resolve(resp);
                }
            };
        });
        xhr.send(data);
        return promise;
    }

    this.synCall = function(method, url){
        var request = new XMLHttpRequest();
        request.open(method, url, false);  // `false` makes the request synchronous
        request.send(null);
        request.success = (request.status >= 200 && request.status <= 399);
        return request;
    }

};

module.exports = Network;