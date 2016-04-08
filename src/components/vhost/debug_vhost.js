var VHost = new function(){

    var vHostInstance = this;

    var Logger  = require('../logger/logger');
    var Newton  = require('../newton/debug_newton');
    var GA      = require('../ga/debug_ga');
    var Network = require('../network/debug_network');

    var vHost;
    var gameSDKVHostUrl = 'a fuoco';

    this.load = function(callback){
        Network.xhr('GET', gameSDKVHostUrl, function(resp){

            vHost = resp.data;

            Logger.debug('GamifiveSDK', 'VHost', 'load', vHost);

            if (typeof callback === 'function'){
                callback();
            }
        });
    }

    this.get = function(key){
        return vHost[key];
    }

};

module.exports = VHost;