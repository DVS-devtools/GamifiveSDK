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
    this.xhr = function(method, url, callback){
        Logger.log('GamifiveSDK', 'Network', method, url);
        
        var xhr = new XMLHttpRequest();
        return new Promise(function(resolve, reject){
            xhr.onreadystatechange = function(){
                if ( xhr.readyState === 4 ) {
                    var resp = xhr;
                    resp.success = (xhr.status >= 200 && xhr.status <= 399);
                    if (callback) {
                        callback(resp);
                    }
                    resolve(resp);
                }
            };

            xhr.open(method, url);
            xhr.send();
        });
    }

};

module.exports = Network;