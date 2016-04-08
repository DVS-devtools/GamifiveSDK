var GA = new function(){

    var Logger = require('../logger/logger');
    var VHost  = require('../vhost/debug_vhost');

    this.init = function(initProperties){
        Logger.debug('GamifiveSDK', 'GA', 'login', initProperties);
    }
    
    this.trackEvent = function(eventProperties){
        Logger.debug('GamifiveSDK', 'GA', 'trackEvent', eventProperties);
    }

    this.pageTrack = function(url){
        url =  url || window.location.origin;
        Logger.debug('GamifiveSDK', 'GA', 'pageTrack', url);
    }

};

module.exports = GA;