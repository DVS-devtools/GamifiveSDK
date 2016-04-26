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
    * loads the necessary information about the game
    * @function load
    * @memberof GameInfo
    */
    this.load = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'load');

        gameInfo = {};
        
        Network.xhr('GET', gameInfoUrl, function(resp){
            gameInfo = resp;
            if (typeof callback === 'function'){
                callback();
            }
        });
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
    * @function getInfo
    * @memberof GameInfo
    */
    this.getInfo = function(){
        return gameInfo;
    }

};

module.exports = GameInfo;