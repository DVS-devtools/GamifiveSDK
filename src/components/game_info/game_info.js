var GameInfo = new function(){

    var gameInfoInstance = this;

    var Logger  = require('../logger/logger');
    var Network = require('../network/network');
    var VHost   = require('../vhost/vhost');

    var gameInfo;
    var gameInfoMockUrl = VHost.get('GAME_INFO_MOCK_URL');

    this.load = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'load');
        Network.xhr('GET', gameInfoMockUrl, callback);
    }

    this.persist = function(callback){
        Logger.log('GamifiveSDK', 'GameInfo', 'persist');
    }

    this.get = function(){
        return JSON.parse(JSON.stringify(gameInfo));
    }

};

module.exports = GameInfo;