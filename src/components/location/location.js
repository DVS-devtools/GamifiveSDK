var Logger = require('../logger/logger');
var Utils = require('../utils/utils');
var Stargate = require('stargatejs');

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
        var href;
        if (Stargate.isHybrid()){
            return [Stargate.getWebappOrigin(), Stargate.getCountryCode()].join('/');            
        } else {
            href = theWindow.location.href;
        }
        
        var isGameasyRegex = new RegExp(/http:\/\/www2?\.gameasy\.com\/([a-zA-Z0-9-_]*)/);        
        var isGameasyMatch = href.match(isGameasyRegex);

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

    /**
     * If a key is in querystring
     * @retuns {boolean} 
     */
    this.hasKey = function(key){
        __setTestEnvIfAny__();
        return Utils.dequeryfy(theWindow.location.href).hasOwnProperty(key);
    }

    /**
     * get the current query string as object
     * @returns {object}
     */
    this.getQueryString = function(){
        __setTestEnvIfAny__();
        return Utils.dequeryfy(theWindow.location.href);
    }

    if (process.env.NODE_ENV === "testing"){
        var original = {
            Stargate: null
        };
    
        locationInstance.setMock = function(what, mock){            
            switch(what){
                case "Stargate":
                    original.Stargate = require('stargatejs');;
                    Stargate = mock;
                    break;
            }
        }

        locationInstance.unsetMock = function(what){
            if (!original[what]) return;
            switch(what){
                case "Stargate":
                    Stargate = original.Stargate;
                    original.Stargate = null;
                    break;
            }
        }
    }
    
};

module.exports = Location;