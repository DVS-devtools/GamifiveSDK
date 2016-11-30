var Logger = require('../logger/logger');
var Stargate = require('stargatejs');
var Utils = Stargate.Utils;
var VHost = require('../vhost/vhost');
var windowConf = require('./windowConf');
import Constants from '../constants/constants';

/**
* Utility module for managing locations
* @namespace Location
* @version 0.9
*/
var Location = new function(){
    var theWindow = {};
    var locationInstance = this;
    var DEBUG_OPTIONS = {};
    function __setTestEnvIfAny__(){        
        if (process.env.NODE_ENV === "testing" && window.fakewindow){            
            theWindow = window.fakewindow;
            // Logger.log("TESTING ENV", theWindow);
        } else if(process.env.NODE_ENV === "debug"){
            // game_id f5df5ed9bdf6166bd38068440f50f144
            var _key;
            Object.keys(window.localStorage)
                .filter((key)=> key.startsWith(Constants.GFSDK_DEBUG_KEY_PREFIX))
                .map((key)=> {
                    _key = key.split(Constants.GFSDK_DEBUG_KEY_PREFIX)[1];
                    DEBUG_OPTIONS[_key] = localStorage[key];
                });
            theWindow.location = windowConf(DEBUG_OPTIONS);
        } else {
            theWindow = window;
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
    
    /**
     * gameasy.ru, gameasy.sg, www.gameasy.com
     * @returns {Boolean} - return if the hostname it's a gamifive whitelabel
     */
    this.isGameasy = function(){
        __setTestEnvIfAny__();
        /**
         * this regex should get host
         * let hostRegex = new RegExp(/(https?:)\/\/(www2?)?\.?([a-zA-Z0-9_-]+)\.?\.[a-zA-Z0-9_-]{2,}/, 'g');
         */
        let host = theWindow.location.host || theWindow.location.hostname;
        let domainLevels = host.split('.');
        return domainLevels.some((level)=> { return level.indexOf("gameasy") > -1;  });
    }

    /**
     * For now every whitelabel that it's not gameasy it's a gamifive
     * @returns {Boolean} - return if the hostname it's a gamifive whitelabel
     */
    this.isGamifive = function(){
        __setTestEnvIfAny__();
        return !this.isGameasy();
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