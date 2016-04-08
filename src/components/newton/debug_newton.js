var Newton = new function(){

    var Logger = require('../logger/logger');
    var VHost  = require('../vhost/debug_vhost');
        
    this.init = function(initProperties){
        Logger.debug('GamifiveSDK', 'Newton', 'login', initProperties);
    }

    this.login = function(userid, properties, callback){
        Logger.debug('GamifiveSDK', 'Newton', 'login', userid, properties);
        if (typeof callback === 'function'){
            callback();
        }
    }

    this.trackEvent = function(eventProperties){
        Logger.debug('GamifiveSDK', 'Newton', 'trackEvent', eventProperties);
    }

    this.pageTrack = function(url){
        url = url || window.location.origin;
        Logger.debug('GamifiveSDK', 'Newton', 'pageTrack', url);
    }

};

module.exports = Newton;