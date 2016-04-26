var Logger = require('../logger/logger');
var VHost  = require('../vhost/vhost');


/**
* Google Analytics module
* @namespace GA
* @version 0.9
*/
var GA = new function(){

    /**
    * initializes Google Analytics
    * @function init
    * @memberof GA
    */
    this.init = function(initProperties){
        Logger.log('GamifiveSDK', 'GA', 'login', initProperties);
    }
    
    /**
    * sends a Google Analytics event
    * @function trackEvent
    * @memberof GA
    */
    this.trackEvent = function(eventProperties){
        Logger.log('GamifiveSDK', 'GA', 'trackEvent', eventProperties);
    }

    /**
    * sends a Google Analytics pageview
    * @function pageTrack
    * @memberof GA
    */
    this.pageTrack = function(url){
        url =  url || window.location.origin;
        Logger.log('GamifiveSDK', 'GA', 'pageTrack', url);
    }

};

module.exports = GA;