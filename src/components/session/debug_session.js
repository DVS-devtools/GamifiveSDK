var Logger = require('.components/');

var Session = new function(){
    this.init = function(params){
        Logger.error('GamifiveSDK', 'Session', 'init', 'not implemented');
    }

    this.onStartSession = function(callback){
        Logger.error('GamifiveSDK', 'Session', 'onStartSession', 'not implemented');
    }

    this.startSession = function(){
        Logger.error('GamifiveSDK', 'Session', 'startSession', 'not implemented');
    }

    this.onPauseEnter = function(callback){
        Logger.error('GamifiveSDK', 'Session', 'onPauseEnter', 'not implemented');
    }

    this.onPauseExit = function(callback){
        Logger.error('GamifiveSDK', 'Session', 'onPauseExit', 'not implemented');
    }

    this.endSession = function(data){
        Logger.error('GamifiveSDK', 'Session', 'init', 'not implemented');
    }
};

module.exports = Session;