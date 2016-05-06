var Logger = require('../logger/logger');

/**
* Utility module for managing locations
* @namespace Location
* @version 0.9
*/
var Location = new function(){

    var locationInstance = this;
    
    /**
    * returns the main page of the webapp
    * @function getOrigin
    * @memberof Location
    */
    this.getOrigin = function(){

        if (!window.location.origin) {
          window.location.origin = window.location.protocol + "//" 
                                    + window.location.hostname 
                                    + (window.location.port ? ':' + window.location.port: '');
        }
        
        // VHost not loaded yet or missing variable
        var isGameasyRegex = new RegExp('http://www.gameasy.com/([a-zA-Z0-9-_]*)');
        var isGameasyMatch = window.location.href.match(isGameasyRegex);

        var gameasyCountryCode = '';
        if (isGameasyMatch !== null){
            gameasyCountryCode = isGameasyMatch[1];
        }

        return window.location.origin + '/' + gameasyCountryCode;
    }

    /**
    * returns the current window.location.href
    * @function getCurrentHref
    * @memberof Location
    */
    this.getCurrentHref = function(){
        return window.location.href;
    }
};

module.exports = Location;