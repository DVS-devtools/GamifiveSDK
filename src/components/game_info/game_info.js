var API = require('../api/api');
var Constants  = require('../constants/constants');
var Logger     = require('../logger/logger');
var Location   = require('../location/location');
var Network    = require('../network/network');
var Stargate   = require('stargatejs');

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
        // TODO: hybrid match pattern
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
        Logger.warn('GamifiveSDK', 'GameInfo', 'persist', 'not implemented');
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

            return Stargate.file.readFileAsJSON(Constants.GAMEINFO_JSON_FILENAME)
               .then(function(responseData) {                   
                    for (var key in responseData){
                        gameInfo[key] = responseData[key];
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
        return Network.xhr('GET', urlToCall, function(resp, req){

            if(!!resp && resp.success){
                
                var responseData = resp.response;

                if (typeof responseData == typeof ''){
                    try{
                        responseData = JSON.parse(responseData);
                    } catch(e) {
                        Logger.error("GameInfo", "getGameInfoFromAPI", "GET", urlToCall, "error parsing gameinfo");
                        throw e;
                    }
                    
                }

                Logger.log('GamifiveSDK', 'GameInfo', 'fetch complete');

                if(responseData.game_info){
                    for (var key in responseData.game_info){
                        gameInfo[key] = responseData.game_info[key];
                    }
                } else {                    
                    throw resp.status + " getting gameinfo";
                }
                
                // TODO: Save gamifiveinfo
                if (Stargate.isHybrid()) {
                    var filePath = [Stargate.file.BASE_DIR, Constants.GAMEINFO_JSON_FILENAME].join("");
                    Stargate.file.write(filePath, JSON.stringify(gameInfo));
                }
            } else {
                Logger.warn(Constants.ERROR_GAMEINFO_FETCH_FAIL + resp.status + ' ' + resp.statusText + ' ');
            }

            if (typeof callback === 'function'){
                callback(gameInfo);
            }
            
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
        this.setStargateMock = function(theMock){
            originalStargate = Stargate;
            Stargate = theMock;
        }

        this.unsetStargateMock = function(){
            Stargate = originalStargate;
        }
    }

};

module.exports = GameInfo;