var GameInfo = new function(){

    var gameInfoInstance = this;

    var Logger  = require('../logger/logger');
    var Network = require('../network/network');
    var VHost   = require('../vhost/vhost');

    var gameInfo;
    var gameInfoUrl; 

    VHost.afterLoad(function(){
        gameInfoUrl = VHost.get('GAME_INFO_URL');
    });

    this.load = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'load');
        Network.xhr('GET', gameInfoUrl, callback);
    }

    this.persist = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'persist');
    }

    this.getInfo = function(){
        return gameInfo;
    }

};

module.exports = GameInfo;