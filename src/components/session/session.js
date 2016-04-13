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

    var getLastSession = function(){
        if (typeof config.sessions === typeof [] && config.sessions.length > 0){
            return config.sessions[0];
        }
        return null;
    }

    this.start = function(){
        Logger.info('GamifiveSDK', 'Session', 'start');

        var addNewSession = function(){
            config.sessions.unshift({
                startTime: new Date(),
                endTime: undefined,
                score: undefined,
                level: undefined
            });
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

        if (typeof config.sessions[0].endTime !== 'undefined'){
            throw 'GamifiveSDK :: Session :: end :: session already ended';
        }

        config.sessions[0].endTime = new Date();

        if (typeof data.score !== 'undefined'){
            if (typeof data.score === 'number'){
                config.sessions[0].score = data.score;
            } else {
                throw 'GamifiveSDK :: Session :: end :: invalid type of score: \
                    expected number, got ' + typeof data.score;
            }
        }

        if (typeof data.level !== 'undefined'){
            if (typeof data.level === 'number'){
                config.sessions[0].level = data.level;
            } else {
                throw 'GamifiveSDK :: Session :: end :: invalid type of level: \
                    expected number, got ' + typeof data.level;
            }
        }

        Menu.show();
    }

    this.goToHome = function(){
        Logger.info('GamifiveSDK', 'Session', 'goToHome');
    }

};

module.exports = Session;