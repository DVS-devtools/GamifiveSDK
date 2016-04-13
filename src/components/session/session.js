var Session = new function(){

    var sessionInstance = this;

    var Logger  = require('../logger/logger');
    var Newton  = require('../newton/newton');
    var GA      = require('../ga/ga');
    var VHost   = require('../vhost/vhost');
    var Network = require('../network/network');
    var Menu    = require('../menu/menu');

    var startCallback;

    var config = {};

    this.getConfig = function(){
        return config;
    }

    this.init = function(params){
        Logger.info('GamifiveSDK', 'Session', 'init', params);

        if (!!params){
            if (typeof params.moreGamesButtonStyle !== 'undefined'){
                Menu.setCustomStyle(params.moreGamesButtonStyle);
            }
        }

        for (var key in params){
            config[key] = params[key];
        }

        // allows starting a new session
        config.sessions = [];

        VHost.afterLoad(function(){

            Menu.init({
                goToHomeCallback: sessionInstance.goToHome
            });
            Menu.show();
            
        });

        VHost.load();
    }

    this.reset = function(){
        config = {};
    }

    this.start = function(){
        Logger.info('GamifiveSDK', 'Session', 'start');

        var addNewSession = function(){
            lastSession.unshift({startTime: new Date()})
        }

        if (typeof config.sessions === typeof []){

            if (config.sessions.length === 0){
                addNewSession();
            } else {
                var lastSession = config.sessions[0];
                if (typeof lastSession.endTime !== 'undefined'){
                    addNewSession();
                } else {
                    throw 'GamifiveSDK :: Session :: start :: previous session not ended';
                }
            }

        } else {
            throw 'GamifiveSDK :: Session :: start :: init not called';
        }

        startCallback();
    }

    this.onStart = function(callback){
        Logger.info('GamifiveSDK', 'Session', 'onStart');
        Menu.hide();

        if (typeof callback === 'function'){
            startCallback = callback;
        } else {
            throw 'GamifiveSDK :: session :: onStart :: invalid value \
                    for callback: expected function, got "' + typeof callback + '"';
        }
    }   

    this.onPauseEnter = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseEnter');
        Menu.show();
    }

    this.onPauseExit = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseExit');
        Menu.hide();
    }

    this.end = function(data){
        Logger.info('GamifiveSDK', 'Session', 'end', data);

        if (config.sessions.length < 1){
            throw 'GamifiveSDK :: Session :: end :: session not started';
        }
        config.sessions[0].endTime = new Date();

        Menu.show();
    }

    this.goToHome = function(){
        Logger.info('GamifiveSDK', 'Session', 'goToHome');
    }

};

module.exports = Session;