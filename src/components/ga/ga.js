var Logger = require('../logger/logger');
var VHost  = require('../vhost/vhost');

var GA = new function(){

    this.init = function(initProperties){
        Logger.log('GamifiveSDK', 'GA', 'login', initProperties);
    }
    
    this.trackEvent = function(eventProperties){
        Logger.log('GamifiveSDK', 'GA', 'trackEvent', eventProperties);
    }

    this.pageTrack = function(url){
        url =  url || window.location.origin;
        Logger.log('GamifiveSDK', 'GA', 'pageTrack', url);
    }

};

module.exports = GA;