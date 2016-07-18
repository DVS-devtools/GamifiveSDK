var Constants = require('../constants/constants');
var Barrier   = require('../barrier/barrier');
var DOMUtils  = require('../dom/dom-utils');
var Event     = require('../event/event');
var Facebook  = require('../fb/fb');
var GA        = require('../ga/ga');
var GameInfo  = require('../game_info/game_info');
var Location  = require('../location/location');
var Logger    = require('../logger/logger');
var Menu      = require('../menu/menu');
var Network   = require('../network/network');
var Newton    = require('../newton/newton');
var User      = require('../user/user');
var VHost     = require('../vhost/vhost');
var Promise = require('promise-polyfill');
var Stargate  = require('stargatejs');

/**
* Session module
* @namespace Session
* @version 0.9
*/
var Session = new function(){
    
    var initPromise;
    var initialized = false;
    var sessionInstance = this;

    var startCallback;

    var config;    

    var isInitializing = false;
    var initBarrier = new Barrier('SessionInit', ['VHost.load', 'User.fetch', 'GameInfo.fetch']);

    /**
    * returns whether Session has already been initialized
    * @function isInitialized
    * @memberof Session
    */
    this.isInitialized = function(){
        return initialized;
    }

    /**
    * resets the internal configuration to default value
    * @function reset
    * @memberof Session
    */
    this.reset = function(){
        config = {};
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
    * sets a callback to be fired after the VHost has been loaded
    * @function afterLoad
    * @private
    * @memberof VHost
    */
    var afterInit = function(callback){
        if (typeof callback !== 'function'){
            throw Constants.ERROR_AFTERINIT_CALLBACK_TYPE + typeof callback;
        }

        /*
        if (initBarrier.isComplete()){
            callback();
        } else {
            initBarrier.onComplete(callback);
        }
        */
        if (initPromise){
            initPromise.then(callback)
        } else {
            throw new Error(Constants.ERROR_SESSION_INIT_NOT_CALLED);
        }
    }

    /**
    * initializes the module with custom parameters
    * @function init
    * @memberof Session
    * @param {Object} params can contain "lite" (boolean) attribute
    */
    this.init = function(params){
        Logger.info('GamifiveSDK', 'Session', 'init', params);        
        
        isInitializing = true;
        config.sessions = [];

        if (!params){
            params = {};
        }

        if (typeof params.lite != 'undefined' && typeof params.lite != 'boolean'){
            throw Constants.ERROR_LITE_TYPE + typeof params.lite;
        }

        // copy parameters into internal configuration
        for (var key in params){
            config[key] = params[key];
        }

        if (typeof config.moreGamesButtonStyle !== 'undefined'){
            Menu.setCustomStyle(config.moreGamesButtonStyle);
        }

        /*VHost.afterLoad(function(){

            initBarrier.setComplete('VHost.load');
            
            User.fetch(function(){
                initBarrier.setComplete('User.fetch');
            });

            GameInfo.fetch(function(){
                initBarrier.setComplete('GameInfo.fetch');
            });
            
            config.sessions = [];
        });*/

        // let's dance
        initPromise = VHost.load().then(function(){
            console.log("VHOST load");
            return Promise.all([User.fetch(), GameInfo.fetch()])
                .then(function(results){
                    Logger.info('Init completed');
                    initialized = true;
                    isInitializing = false;
                }).catch(function(reason){
                    console.log("Init Catch", reason);
                    Logger.error(reason);
                    initialized = false;
                    isInitializing = false;
                    throw reason;
                });            
        });
        return initPromise;
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
            throw Constants.ERROR_SESSION_INIT_NOT_CALLED;
        }

        Logger.log('GamifiveSDK', 'Session', 'init has been called correctly');

        // if a previous session exists, it must have been ended
        if (config.sessions.length > 0 && typeof getLastSession().endTime === 'undefined'){
            throw Constants.ERROR_SESSION_ALREADY_STARTED;
        }

        // ok, you can try to start a new session
        config.sessions.unshift({
            startTime: new Date(),
            endTime: undefined,
            score: undefined,
            level: undefined
        });

        // cut out the older sessions
        config.sessions = config.sessions.slice(0, Constants.MAX_RECORDED_SESSIONS_NUMBER);

        Menu.hide();

        var doStartSession = function(){
            console.log("doStartSession");
            initPromise.then(function(){
                // ADD TRACKING HERE
                
                if (typeof startCallback === 'function') {
                    console.log("START CALLBACK TYPE");
                    try {
                        startCallback();
                    } catch (e){
                        Logger.error('GamifiveSDK', 'startSession', 'error while trying to start a session', e);
                        // restore menu, to be able to go back to main page
                        Menu.show();
                    }
                }
            });
            
        }

        if (!config.lite){            
            Network.xhr('GET', VHost.get('MOA_API_CANDOWNLOAD'), function(resp){
                Utils.log('GamifiveSDK', 'Session', 'start', 'can play', resp);

                if(VarCheck.get(resp, ['response', 'canDownload'])){
                    // clear dom
                    DOMUtils.delete();
                    doStartSession();
                } else {
                    // call gameover API
                    Network.xhr('GET', VHost.get('MOA_API_GAMEOVER'), function (resp) {
                        DOMUtils.create(resp);
                        DOMUtils.show(Constants.PAYWALL_ELEMENT_ID);
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
            throw Constants.ERROR_ONSTART_CALLBACK_TYPE + typeof callback;
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

        if (typeof config.sessions !== typeof [] || config.sessions.length < 1){
            throw Constants.ERROR_SESSION_NO_SESSION_STARTED;
        }

        if (typeof getLastSession().endTime !== 'undefined'){
            throw Constants.ERROR_SESSION_ALREADY_ENDED;
        }

        getLastSession().endTime = new Date();

        if (typeof data.score !== 'undefined'){
            if (typeof data.score === 'number'){
                getLastSession().score = data.score;
            } else {
                throw Constants.ERROR_SCORE_TYPE + typeof data.score;
            }
        }

        if (typeof data.level !== 'undefined'){
            if (typeof data.level === 'number'){
               getLastSession().level = data.level;
            } else {
                throw Constants.ERROR_LEVEL_TYPE + typeof data.level;
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
        if (Stargate.isHybrid()){
            if (Stargate.checkConnection().networkState === "offline") {
                Stargate.goToLocalIndex();
            } else {
                Stargate.goToWeblIndex();
            }            
        }
    }

};

module.exports = Session;
