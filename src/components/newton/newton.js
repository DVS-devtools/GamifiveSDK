var Logger = require('../logger/logger');
var VHost  = require('../vhost/vhost');


/**
* Newton module
* @namespace Newton
* @version 0.9
*/
var Newton = new function(){
    
    /**
    * initializes Newton
    * @function init
    * @memberof Newton
    */
    this.init = function(initProperties){
        Logger.log('GamifiveSDK', 'Newton', 'login', initProperties);
    }

    /**
    * performs a Newton login
    * @function login
    * @memberof Newton
    */
    this.login = function(userid, properties, callback){
        Logger.log('GamifiveSDK', 'Newton', 'login', userid, properties);
        if (typeof callback === 'function'){
            callback();
        }
    }

    /**
    * sends a Google Analytics event
    * @function trackEvent
    * @memberof Newton
    */
    this.trackEvent = function(eventProperties){
        Logger.log('GamifiveSDK', 'Newton', 'trackEvent', eventProperties);
    }

    /**
    * sends a Newton event to track a pageview
    * @function pageTrack
    * @memberof Newton
    */
    this.pageTrack = function(url){
        url = url || window.location.origin;
        Logger.log('GamifiveSDK', 'Newton', 'pageTrack', url);
    }

};

module.exports = Newton;