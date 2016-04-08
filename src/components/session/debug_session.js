var Session = new function(){

    var Logger  = require('../logger/logger');
    var Newton  = require('../newton/debug_newton');
    var GA      = require('../ga/debug_ga');
    var VHost   = require('../vhost/debug_vhost');
    var Network = require('../network/debug_network');

    var config;

    this.getConfig = function(){
        return config;
    }

    this.init = function(params){
        config = {};

        Logger.info('GamifiveSDK', 'Session', 'init', params);
    }

    this.onStartSession = function(callback){
        Logger.debug('GamifiveSDK', 'Session', 'onStartSession');
    }

    this.startSession = function(){
        Logger.info('GamifiveSDK', 'Session', 'startSession');
    }

    this.onPauseEnter = function(callback){
        Logger.debug('GamifiveSDK', 'Session', 'onPauseEnter');
    }

    this.onPauseExit = function(callback){
        Logger.debug('GamifiveSDK', 'Session', 'onPauseExit');
    }

    this.endSession = function(data){
        Logger.info('GamifiveSDK', 'Session', 'endSession', data);
    }
};

module.exports = Session;