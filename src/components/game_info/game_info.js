var API = require('../api/api');
var Constants  = require('../constants/constants');
var Logger     = require('../logger/logger');
var Location   = require('../location/location');
var Network    = require('../network/network');
var Stargate   = require('stargatejs');
var extend = require('stargatejs').Utils.extend;
var JSONPRequest = require('http-francis').JSONPRequest;

/**
* GameInfo module
* @namespace GameInfo
* @version 0.9
*/
var GameInfo = new function(){

    var gameInfoInstance = this;

    var gameInfo = {};
    var gameInfoUrl;
    
    /**
    * resets the information about the game
    * @function reset
    * @memberof GameInfo
    */
    this.reset = function(){
        Logger.log('GamifiveSDK', 'GameInfo', 'reset');
        gameInfo = {};
    }

    /**
     * getInfo 
     * @public
     * @function getContentId
     * @memberof GameInfo
     * @returns {object} [gameInfo={}]
     */    
    this.getInfo = function(){
        return gameInfo;
    }

    /**
    * returns the contentId of the game executing a regex on the current url
    * @function getContentId
    * @memberof GameInfo
    */
    this.getContentId = function(){        
        var urlToMatch = Location.getCurrentHref();
        var contentIdRegex = new RegExp(Constants.CONTENT_ID_REGEX);
        var match = urlToMatch.match(contentIdRegex);

        if (match !== null && match.length > 0){
            return match[2];
        }
        throw Constants.ERROR_GAME_INFO_NO_CONTENTID + urlToMatch;
    }

    /**
    * saves the necessary information about the game, to be able to use it offline
    * @function persist
    * @memberof GameInfo
    */
    this.persist = function(callback){
        Logger.info('GamifiveSDK', 'GameInfo', 'persist', gameInfo);
        
        // save on file only if i'm running game from the disk
        if (Stargate.isHybrid() && window.location.protocol === 'cdvfile:') {
            var GAMEINFO_FILE_PATH = [Stargate.file.BASE_DIR, Constants.GAMEINFO_JSON_FILENAME].join("");
            
            return Stargate.file.readFileAsJSON(GAMEINFO_FILE_PATH)
                .then(function(offlineData){
                    offlineData.GamifiveInfo[gameInfoInstance.getContentId()] = gameInfo;
                    return offlineData;
                }).then(function(updated){
                    return Stargate.file.write(GAMEINFO_FILE_PATH, JSON.stringify(updated));
                });
        }
    }

    /**
    * returns the necessary information about the game
    * @function fetch
    * @memberof GameInfo
    */
    this.fetch = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'fetch attempt');
        
        if (Stargate.checkConnection().type === 'online'){
            return getGameInfoFromAPI(callback);
        } else if (Stargate.checkConnection().type === 'offline' && Stargate.isHybrid()) {
            var GAMEINFO_FILE_PATH = [Stargate.file.BASE_DIR, Constants.GAMEINFO_JSON_FILENAME].join("");
            return Stargate.file.readFileAsJSON(GAMEINFO_FILE_PATH)
               .then(function(offlineData) {
                    if (offlineData.GamifiveInfo){                        
                        var toSave = offlineData.GamifiveInfo[gameInfoInstance.getContentId()];
                        Logger.log('GameInfo from file', toSave);
                        if (toSave){
                            gameInfo = extend(gameInfo, toSave);                            
                        }  else {
                            throw new Error('GamifiveSDK could not retrieve GameInfo for ' + gameInfoInstance.getContentId() + ' from file');
                        }                        
                    }
                    
                    if (typeof callback === "function") { callback(gameInfo); }
                    return gameInfo;                    
                });
        }
    }

    /**
     * getGameInfoFromAPI
     * @param {function} callback - filled with gameinfo {object} 
     * @returns {promise}
     */
    function getGameInfoFromAPI(callback){
        gameInfoUrl = API.get('GAME_INFO_API_URL');
        var urlToCall = [gameInfoUrl, gameInfoInstance.getContentId()].join("");

        Logger.log("GameInfo", "getGameInfoFromAPI", "GET", urlToCall);
        return new JSONPRequest(urlToCall, 5000).prom.then(function(resp){

            if(typeof resp.game_info === 'undefined'){
                throw new Error('GamifiveSDK: Missing game_info key in' + resp);
            }

            gameInfo = extend(gameInfo, resp.game_info);

            if (typeof callback === 'function'){
                callback(gameInfo);
            }
            Logger.log('GamifiveSDK', 'GameInfo', 'fetch complete');
            return gameInfoInstance.persist();
            
        });
    }
    
    /**
    * returns a single value of gameInfo, given its key
    * @function get
    * @memberof GameInfo
    * @returns *|undefined
    */
    this.get = function(key){
        return gameInfo[key];
    }

    if(process.env.NODE_ENV === "testing"){        
        var originalStargate;
        var originals = {};
        this.setStargateMock = function(theMock){
            originalStargate = Stargate;
            Stargate = theMock;
        };

        this.unsetStargateMock = function(){
            Stargate = originalStargate;
        };

        this.setMock = function(modName, mock){
            switch (modName){
                case 'JSONPRequest':
                    originals.JSONPRequest = require('http-francis').JSONPRequest;
                    JSONPRequest = mock;
                    break;
            }
        };

        this.unsetMock = function(modName){
            if(!originals[modName]){ return;}
            switch (modName){
                case 'JSONPRequest':
                    JSONPRequest = originals.JSONPRequest;
                    break;
            }
        }
    }

};

module.exports = GameInfo;