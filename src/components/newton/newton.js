var Logger = require('../logger/logger');
var VHost  = require('../vhost/vhost');
    
var Newton = new function(){
        
    this.init = function(initProperties){
        Logger.log('GamifiveSDK', 'Newton', 'login', initProperties);
    }

    this.login = function(userid, properties, callback){
        Logger.log('GamifiveSDK', 'Newton', 'login', userid, properties);
        if (typeof callback === 'function'){
            callback();
        }
    }

    this.trackEvent = function(eventProperties){
        Logger.log('GamifiveSDK', 'Newton', 'trackEvent', eventProperties);
    }

    this.pageTrack = function(url){
        url = url || window.location.origin;
        Logger.log('GamifiveSDK', 'Newton', 'pageTrack', url);
    }

};

module.exports = Newton;