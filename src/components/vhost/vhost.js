var VHost = new function(){

    var vHostInstance = this;

    var Logger  = require('../logger/logger');   
    var Network = require('../network/network');

    var vHost = {};
    var gameSDKVHostUrl = 'api/vhost';

    this.load = function(callback){
        Network.xhr('GET', gameSDKVHostUrl, function(resp){

            vHost = resp.response;
            Logger.debug('GamifiveSDK', 'VHost', 'load', vHost);

            if (typeof callback === 'function'){
                callback(vHost);
            }
        });
    }

    this.get = function(key){
        return vHost[key];
    }

};

module.exports = VHost;