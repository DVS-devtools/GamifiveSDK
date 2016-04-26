var Logger  = require('../logger/logger');
var Network = require('../network/network');
var VHost   = require('../vhost/vhost');

/**
* GameInfo module
* @namespace GameInfo
* @version 0.9
*/
var GameInfo = new function(){

    var gameInfoInstance = this;

    var gameInfo;
    var gameInfoUrl;

    VHost.afterLoad(function(){
        gameInfoUrl = VHost.get('GAME_INFO_URL');
    });

    /**
    * resets the information about the game
    * @function reset
    * @memberof GameInfo
    */
    this.reset = function(){
        Logger.log('GamifiveSDK', 'GameInfo', 'reset');
        gameInfo = undefined;
    }

    /**
    * saves the necessary information about the game, to be able to use it offline
    * @function persist
    * @memberof GameInfo
    */
    this.persist = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'persist');
    }

    /**
    * returns the necessary information about the game
    * @function fetch
    * @memberof GameInfo
    */
    this.fetch = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'fetch attempt');

        Network.xhr('GET', gameInfoUrl, function(resp){
            Logger.log('GamifiveSDK', 'GameInfo', 'fetch complete', resp);

            if (typeof gameInfo === 'undefined'){
                gameInfo = {};
            }

            // TODO: check this
            if(!!resp && typeof resp.response !== 'undefined'){
                for (var key in resp.response){
                    gameInfo[key] = resp.response[key];
                }
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