var Network = new function(){

    var networkInstance = this;

    var Logger = require('../logger/logger');
    
    this.xhr = function(method, url, callback, isSynchronous){

        if (method.toUpperCase() === 'JSONP'){

            var script = document.createElement('script');

            url += (url.indexOf('?') < 0 ? '?' : '&') + 'callback=window.handle_jsonp&format=jsonp';
            script.src = url;

            window.handle_jsonp = function(data){
                callback(data);
            }
            document.getElementsByTagName('head')[0].appendChild(script);

        } else {
            
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function(){
                if ( xhr.readyState === 4 ) {
                    var resp;
                    try {
                        resp = xhr.response.replace(/(\n|\r)/gm,"");
                        resp = JSON.parse(resp);
                    } catch(e) { 
                        resp = xhr;
                    }
                    resp.success = (xhr.status >= 200 && xhr.status <= 399);
                    if (callback) {
                        callback(resp , xhr);
                    }
                }
            };

            // xhr.open accepts a parameter to specify if execution must be async (true) or sync (false)
            var isAsynchronous = !isSynchronous;
            xhr.open(method, url, isAsynchronous);
            xhr.send();   
            return xhr;
        }
    }

};

module.exports = Network;