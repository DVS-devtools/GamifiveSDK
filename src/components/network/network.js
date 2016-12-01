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
    * @param {String} method - POST,GET,PUT,DELETE,PATCH
    * @param {String} url - the url to call
    * @param {Object} [options={data:null,headers:null,responseType:null}] - data to send headers to set responseType if any
    * @returns {Promise<HTTPResponse>}
    */
    this.xhr = function(method, url, options={data:null, headers:null, responseType:null}){
        var xhr;
        if (window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");            
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
        xhr.open(method, url);
        // Set headers if any
        if(options.headers){
            for(var key in options.headers){
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        // Set responseType
        if(options.responseType){
            xhr.responseType = options.responseType
        }

        xhr.send(options.data);
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