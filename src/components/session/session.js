
var Logger   = require('../logger/logger');
var Newton   = require('../newton/newton');
var GA       = require('../ga/ga');
var VHost    = require('../vhost/vhost');
var Network  = require('../network/network');
var Menu     = require('../menu/menu');
var Location = require('../location/location');
var Facebook = require('../fb/fb');
var Overlay = require('../overlay/overlay');

/**
* Session module
* @namespace Session
* @version 0.9
*/
var Session = new function(){

    var sessionInstance = this;

    var startCallback;

    var config;

    /**
    * resets the internal configuration to default value
    * @function reset
    * @memberof Session
    */
    this.reset = function(){
        config = {
            MAX_RECORDED_SESSIONS_NUMBER: 2
        };
    }
    // apply default configuration
    sessionInstance.reset();

    /**
    * returns the internal configuration
    * @function getConfig
    * @memberof Session
    */
    this.getConfig = function(){
        return config;
    }

    /**
    * initializes the module with custom parameters
    * @function init
    * @memberof Session
    * @param {Object} params can contain "lite" (boolean) attribute
    */
    this.init = function(params){
        Logger.info('GamifiveSDK', 'Session', 'init', params);

        // copy parameters into internal configuration
        for (var key in params){
            config[key] = params[key];
        }

        if (typeof config.moreGamesButtonStyle !== 'undefined'){
            Menu.setCustomStyle(config.moreGamesButtonStyle);
        }

        // allows starting a new session
        config.sessions = [];

        Menu.show();
        
        // let's dance
        VHost.load();
    }

    var getLastSession = function(){
        return config.sessions[0];
    }

    /**
    * starts a new gameplay session
    * @function start
    * @memberof Session
    */
    this.start = function(){
        Logger.info('GamifiveSDK', 'Session', 'start');

        // if init has been called, then config.session will be []
        if (typeof config.sessions !== typeof []){
            throw 'GamifiveSDK :: Session :: start :: init not called';
        }

        // if a previous session exists, it must have been ended
        if (config.sessions.length > 0 & typeof getLastSession().endTime === 'undefined'){
            throw 'GamifiveSDK :: Session :: start :: previous session not ended';     
        }

        var doStartSession = function(){
            // ok, you can start a new session
            config.sessions.unshift({
                startTime: new Date(),
                endTime: undefined,
                score: undefined,
                level: undefined
            });

            config.sessions = config.sessions.slice(0, config.MAX_RECORDED_SESSIONS_NUMBER);
            
            Menu.hide();

            // ADD TRACKING HERE

            if (typeof startCallback === 'function') {
                try {
                    startCallback();
                } catch (e){
                    Logger.error('GamifiveSDK', 'startSession', 'error while trying to start a session', e);
                    // restore menu, to be able to go back to main page
                    Menu.show();
                }
            }
        }

        if (config.lite){
            Network.xhr('GET', VHost.get('canDownloadUrl'), function(resp){
                Utils.log('GamifiveSDK', 'Session', 'start', 'can play', resp);

                if(VarCheck.get(resp, ['response', 'canDownload'])){
                    // clear dom
                    Overlay.delete();
                    doStartSession();
                } else {
                    // call gameover API
                    Network.xhr('GET', VHost.get('gameoverUrl'), function (resp) {
                        // render page with resp
                        Overlay.create(resp);

                        // throw event 'user_no_credits'
                        throwEvent('user_no_credits');
                    });
                }
            });
        } else {
            doStartSession();
        }
        
    }

    /**
    * sets a callback function to be called when starting a gameplay session
    * @function onStart
    * @memberof Session
    * @param {function} callback the function to be called when the game starts
    */
    this.onStart = function(callback){
        Logger.info('GamifiveSDK', 'Session', 'onStart');

        if (typeof callback === 'function'){
            startCallback = callback;
        } else {
            throw 'GamifiveSDK :: session :: onStart :: invalid value \
                    for callback: expected function, got "' + typeof callback + '"';
        }
    }

    /**
    * sets a callback function to be called when the game enters pause status
    * @function onPauseEnter
    * @memberof Session
    * @param {function} callback the function to be called when the game pauses
    */
    this.onPauseEnter = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseEnter');
        Menu.show();
    }

    /**
    * sets a callback function to be called when the game exits pause status
    * @function onPauseExit
    * @memberof Session
    * @param {function} callback the function to be called when the game resumes
    */
    this.onPauseExit = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseExit');
        Menu.hide();
    }

    /**
    * ends a session and (if not in lite mode) shows the platform's gameover screen
    * @function end
    * @memberof Session
    * @param {Object} data can contain a "score" and/or "level" attribute
    */
    this.end = function(data){
        Logger.info('GamifiveSDK', 'Session', 'end', data);

        if (config.sessions.length < 1){
            throw 'GamifiveSDK :: Session :: end :: no sessions started';
        }

        if (typeof getLastSession().endTime !== 'undefined'){
            throw 'GamifiveSDK :: Session :: end :: session already ended';
        }

        getLastSession().endTime = new Date();

        if (typeof data.score !== 'undefined'){
            if (typeof data.score === 'number'){
                getLastSession().score = data.score;
            } else {
                throw 'GamifiveSDK :: Session :: end :: invalid type of score: \
                    expected number, got ' + typeof data.score;
            }
        }

        if (typeof data.level !== 'undefined'){
            if (typeof data.level === 'number'){
               getLastSession().level = data.level;
            } else {
                throw 'GamifiveSDK :: Session :: end :: invalid type of level: \
                    expected number, got ' + typeof data.level;
            }
        }

        Menu.show();
    }

    /**
    * returns to the main page of the webapp
    * @function goToHome
    * @memberof Session
    */
    this.goToHome = function(){
        Logger.info('GamifiveSDK', 'Session', 'goToHome');
        window.location.href = Location.getOrigin();
    }

};

module.exports = Session;