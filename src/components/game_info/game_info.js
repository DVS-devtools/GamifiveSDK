var Constants  = require('../constants/constants');
var Logger     = require('../logger/logger');
var Location   = require('../location/location');
var Network    = require('../network/network');
var Stargate   = require('../../../node_modules/stargate/src/index.js');

/**
* GameInfo module
* @namespace GameInfo
* @version 0.9
*/
var GameInfo = new function(){

    var gameInfoInstance = this;

    var gameInfo;
    var gameInfoUrl = Constants.GAME_INFO_API_URL;

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
    * returns the contentId of the game executing a regex on the current url
    * @function getContentId
    * @memberof GameInfo
    */
    this.getContentId = function(){

        var urlToMatch = Location.getCurrentHref();
        var contentIdRegex = new RegExp(Constants.CONTENT_ID_REGEX);
        var match = urlToMatch.match(contentIdRegex);

        if (match !== null && match.length > 0){
            return match[1];
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
        var urlToCall = gameInfoUrl + gameInfoInstance.getContentId();
        
        if (Stargate.checkConnection().networkState === 'online'){

            getGameInfoFromAPI(callback);

        } else if (Stargate.checkConnection().networkState === 'offline' && Stargate.isHybrid()) {

            Stargate.file.readFileAsJSON(Constants.GAMEINFO_JSON_FILENAME)
               .then(function(responseData) {                   
                    for (var key in responseData){
                        gameInfo[key] = responseData[key];
                    }
                });
        }
    }

    /**
     * 
     */
    function getGameInfoFromAPI(callback){
        Network.xhr('GET', urlToCall, function(resp, req){

            if(!!resp && resp.success){
                Logger.log('GamifiveSDK', 'GameInfo', 'fetch complete', responseData);
                var responseData = resp.response;

                if (typeof responseData == typeof ''){
                    responseData = JSON.parse(responseData);
                }

                if (typeof gameInfo === 'undefined'){
                    gameInfoInstance.reset();
                }

                for (var key in responseData){
                    gameInfo[key] = responseData[key];
                }
                // TODO: Save gamifiveinfo
                if (Stargate.isHybrid()) {
                    // Stargate.file.write(Constants.GAMEINFO_JSON_FILENAME, JSON.stringify(gameInfo));
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
    */
    this.get = function(key){
        return gameInfo[key];
    }

};

module.exports = GameInfo;