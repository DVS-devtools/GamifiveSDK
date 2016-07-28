var Logger = require('../logger/logger');

/**
* Utility module for managing locations
* @namespace Location
* @version 0.9
*/
var Location = new function(){
    var theWindow;
    var locationInstance = this;

    function __setTestEnvIfAny__(){        
        
        if (process.env.NODE_ENV === "testing" && window.fakewindow){
            
            theWindow = window.fakewindow;
            // Logger.log("TESTING ENV", theWindow);
        } else {
            theWindow = window;
            // Logger.log("original:", theWindow.location.href);
        }
    }

    /**
    * returns the main page of the webapp
    * @function getOrigin
    * @memberof Location
    */
    this.getOrigin = function(){
        __setTestEnvIfAny__();

        if (!theWindow.location.origin) {
            theWindow.location.origin = theWindow.location.protocol + "//" 
                                    + theWindow.location.hostname 
                                    + (theWindow.location.port ? ':' + theWindow.location.port: '');
        }
        
        var isGameasyRegex = new RegExp(/http:\/\/www2?\.gameasy\.com\/([a-zA-Z0-9-_]*)/);
        var isGameasyMatch = theWindow.location.href.match(isGameasyRegex);

        var gameasyCountryCode = '', 
            toJoin = [];
        // Logger.log(isGameasyMatch);
        if (isGameasyMatch !== null){
            gameasyCountryCode = isGameasyMatch[1];
            // if we are in testing integration mode we need this for url composition
            gameasyCountryCode = gameasyCountryCode === 'test' ? 'ww-it' : gameasyCountryCode;
        }

        toJoin.push(theWindow.location.origin);
        if(gameasyCountryCode && gameasyCountryCode !== ''){
            toJoin.push(gameasyCountryCode);
        }        
        // Logger.log("origin and country code:", theWindow.location.href, isGameasyMatch);
        return toJoin.join("/");
    }

    /**
    * returns the current window.location.href
    * @function getCurrentHref
    * @memberof Location
    */
    this.getCurrentHref = function(){
         __setTestEnvIfAny__();
        return theWindow.location.href;
    }
};

module.exports = Location;