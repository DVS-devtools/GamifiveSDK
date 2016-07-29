var Promise   = require('promise-polyfill');
var API = require('../api/api');
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
var NewtonAdapter = require('newton-adapter');
var User      = require('../user/user');
var VHost     = require('../vhost/vhost');
var VarCheck  = require('../varcheck/varcheck'); 
var Stargate  = require('stargatejs');
/**
 * Utils is the same of stargate
 * TODO: make a package.json and share as dep with stargate
 */
var Utils     = require('../utils/utils');

/**
* Session module
* @namespace Session
* @version 0.9
*/
var Session = new function(){
    
    var initPromise;
    var initialized = false;
    var sessionInstance = this;
    var menuIstance;
    var startCallback;

    var config;    
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
        initPromise = null;
        config = {
            sessions:[]
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

        if (!params){
            params = {};
        }

        Logger.info('GamifiveSDK', 'Session', 'init', params);

        if (typeof params.lite !== 'undefined' && typeof params.lite !== 'boolean'){
            throw Constants.ERROR_LITE_TYPE + typeof params.lite;
        }

        // copy parameters into internal configuration
        for (var key in params){
            config[key] = params[key];
        }

        if (typeof config.moreGamesButtonStyle !== 'undefined'){
            Menu.setCustomStyle(config.moreGamesButtonStyle);
        }

        Menu.setGoToHomeCallback = sessionInstance.goToHome;
        
        // let's dance        
        initPromise = Stargate.initialize()
               .then(function(){
                   return VHost.load();
               })
               .then(function(){

                    Menu.setSpriteImage(VHost.get('IMAGES_SPRITE_GAME'));
                    Menu.show();                    
                    
                    Logger.info("User.fetch & GameInfo.fetch");                   
                    return Promise.all([
                        User.fetch(), 
                        GameInfo.fetch()
                    ]);
               })
               .then(function(){
                   return User.loadData(null, true);
               })
               .then(function(){
                    initialized = true;
                    var env = Stargate.isHybrid() ? "hybrid" : "webapp";
                    NewtonAdapter.init({
                           secretId: VHost.get('NEWTON_SECRETID'),
                           enable: true,        // enable newton
                           waitLogin: false,    // wait for login to have been completed (async)
                           logger: Logger,
                           properties: {
                                environment: env,
                                white_label_id: GameInfo.getInfo().label
                           }
                    });
                    /**                         
                    var gameloadEvent = { 
                        name: 'GameLoad', 
                        properties:{
                            action:"Yes",
                            category:"Play",
                            game_title:GameInfo.getInfo().game.title,
                            label: GameInfo.getContentId(),
                            valuable:"Yes",
                        }
                    };
                    NewtonAdapter.trackEvent(gameLoadEvent);
                     */
                    return true;
               }).catch(function(reason){
                    Logger.error("GamifiveSDK init error: ", reason);
                    /**
                     * TODO:
                     * do we want to track this?
                     *  */
                    initialized = false;
                    throw reason;
               });

        return initPromise; 
    }

    var getLastSession = function(){
        return config.sessions[0];
    }

    /**
    * starts a new gameplay session
    * @function start
    * @access private
    * @memberof Session
    */
    function __start(){
        Logger.info('GamifiveSDK', 'Session', 'start');
        // cut out the older sessions
        config.sessions = config.sessions.slice(0, Constants.MAX_RECORDED_SESSIONS_NUMBER);

        Menu.hide();

        function doStartSession(){
            // ADD TRACKING HERE
            NewtonAdapter.trackEvent({name:"GameStart", properties:{}});
            if (typeof startCallback === 'function') {                
                try {                    
                    startCallback();
                } catch (e){
                    Logger.error('GamifiveSDK', 'startSession', 'error while trying to start a session', e);
                    // restore menu, to be able to go back to main page
                    Menu.show();
                    // rethrow the error
                    throw e;
                }
            }
        }

        if (!config.lite){     
            var urlToCall = API.get('CAN_DOWNLOAD_API_URL')
                               .replace(":ID", GameInfo.getContentId());                
            
            Logger.log('CAN_DOWNLOAD_API_URL', urlToCall);
            Network.xhr('GET', urlToCall)
                .then(function(response){
                    Logger.log('GamifiveSDK', 'Session', 'start', 'can play', response.response);
                    var canPlay = false;
                    try {
                        canPlay = JSON.parse(response.response).canDownload;
                    } catch(e){
                        Logger.error('GamifiveSDK', 'Session', 'error parsing response', urlToCall, e);
                        throw e;
                    }                    
                    return canPlay;

                })
                .then(function(canPlay){
                    if(canPlay){
                        // clear dom
                        DOMUtils.delete();
                        doStartSession();
                    } else {
                        // call gameover API if he can't play
                        var url = [API.get('GAMEOVER_API_URL'), GameInfo.getContentId()].join("/");
                        
                        Logger.log("Gameover ", url);
                        Network.xhr('GET', url).then(function(resp) {
                            DOMUtils.create(resp.response);
                            DOMUtils.show(Constants.PAYWALL_ELEMENT_ID);
                        });
                    }
                });
        } else {            
            doStartSession();
        }
    }

    /**
    * starts a new gameplay session
    * @function start
    * @access public
    * @memberof Session
    */
    this.start = function(){
        if (!initPromise){
            throw Constants.ERROR_SESSION_INIT_NOT_CALLED;
        }
        
        // if a previous session exists, it must have been ended
        if (config.sessions && config.sessions.length > 0 && typeof getLastSession().endTime === 'undefined'){
            throw Constants.ERROR_SESSION_ALREADY_STARTED;
        }

        // ok, you can try to start a new session
        config.sessions.unshift({
            startTime: new Date(),
            endTime: undefined,
            score: undefined,
            level: undefined
        });

        return initPromise.then(__start);
    }

    /**
    * sets a callback function to be called when starting a gameplay session
    * @function onStart
    * @memberof Session
    * @param {function} callback the function to be called when the game starts
    */
    this.onStart = function(callback){       
        
        if (typeof callback === 'function'){
            Logger.info('GamifiveSDK', 'Session', 'register onStart callback');
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
    * @param {Number} data.score - the score of the user in the sesssion
    * @param {Number} data.level - the level
    */
    this.end = function(data){
        NewtonAdapter.trackEvent({name:"GameEnd", properties:{}});
        Logger.info('GamifiveSDK', 'Session', 'end', data);
        
        if (!initPromise){
            throw Constants.ERROR_SESSION_INIT_NOT_CALLED;
        }
        // set default object
        data = data ? data : {};

        if (config.sessions.length < 1){
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

        var lastSession = getLastSession();
        if(config.lite){
            // call only leaderboard
            var leaderboardParams = {
				'start': lastSession.startTime.getTime(),
				'duration': lastSession.endTime - lastSession.startTime,
				'score': lastSession.score,
	      		'newapps': 1,
	      		'appId': GameInfo.getContentId(),
	      		'label': GameInfo.getInfo().label,
	      		'userId': User.getUserId()
			};

			if (typeof lastSession.level !== 'undefined'){
				leaderboardParams.level = lastSession.level;
			}            
           
            var leaderboardCallUrl = API.get('LEADERBOARD_API_URL');
            leaderboardCallUrl = Utils.queryfy(leaderboardCallUrl, leaderboardParams);
            
            Logger.log("Leaderboard ", leaderboardCallUrl);
            
            // TODO: callback when finished here?
            if (Stargate.checkConnection().type === "online"){
                Network.xhr('GET', leaderboardCallUrl);
            } else {
                // saveForLater
            }            

        } else {           
            // call gameover            
            var gameoverParams = {
                start: lastSession.startTime.getTime(),
                duration: lastSession.endTime - lastSession.startTime,
                score: lastSession.score || 'null'                           
            };

            if(lastSession.level){
                gameoverParams.level = lastSession.level;
            }            
            
            gameOver(gameoverParams).then(function(htmlString){
                DOMUtils.create(htmlString);
            });            
        }

        Menu.show();
    }

    /**
     * Build the gameover if online or offline hybrid and returns it as a compiled html string
     * @param {object} gameoverParams
     * @param {number} gameoverParams.start
     * @param {number} gameoverParams.duration
     * @param {number} gameoverParams.score
     * @param {number} [gameoverParams.level]
     * @returns {Promise<string>} the html as string gameover
     */
    function gameOver(gameoverParams){
        var url = [API.get('GAMEOVER_API_URL'), GameInfo.getContentId()].join("/");
        url = Utils.queryfy(url, gameoverParams);
        Logger.log("Gameover ", url);
        
        if (Stargate.checkConnection().type === "online"){
            return Network.xhr('GET', url).then(function(resp) {
                if(Stargate.isHybrid()){
                    gameoverParams.content_id = GameInfo.getContentId();
                    return Stargate.game.buildGameover(gameoverParams);
                }
                return resp.response;
            });
        } else if(Stargate.checkConnection().type === "offline" && Stargate.isHybrid()){
            return Stargate.game.buildGameover(gameoverParams);
        } else {
            Logger.log("Fail build gameover, you are offline", Stargate.checkConnection());
        }
    }
    /**
    * returns to the main page of the webapp
    * @function goToHome
    * @memberof Session
    */
    this.goToHome = function(){
        Logger.info('GamifiveSDK', 'Session', 'goToHome');
        if (Stargate.isHybrid()){
            if (Stargate.checkConnection().type === "offline") {
                Stargate.goToLocalIndex();
            } else {
                Stargate.goToWebIndex();
            }
        } else {
            window.location.href = Location.getOrigin();
        }
    }

    if (process.env.NODE_ENV === "testing"){
        var original = {
            Stargate:null,
            User:null,
            VHost:null,
            GameInfo:null,
            Menu:null
        };

        this.setMock = function(what, mock){            
            switch(what){
                case "User":
                    original.User = require('../user/user');;
                    User = mock;
                    break;
                case "Stargate":
                    original.Stargate = require('stargatejs');;
                    Stargate = mock;
                    break;
                case "VHost":
                    original.VHost = require('../vhost/vhost');
                    VHost = mock;
                    break;
                case "GameInfo":
                    original.GameInfo = require('../game_info/game_info');
                    GameInfo = mock
                    break;
                case "Menu":
                    original.Menu = require('../menu/menu');
                    Menu = mock;
                    break;
                case "NewtonAdapter":
                    original.NewtonAdapter = require('newton-adapter');
                    NewtonAdapter = mock;
                    break;
                default:
                    break;
            }
        }

        this.unsetMock = function(what){
            if (!original[what]) return;
            switch(what){
                case "User":
                    User = original.User;
                    original.User = null;
                    break;
                case "Stargate":
                    Stargate = original.Stargate;
                    original.Stargate = null;
                    break;
                case "VHost":
                    VHost =  original.VHost;
                    original.VHost = null;
                case "GameInfo":
                    GameInfo = original.GameInfo;
                    original.GameInfo = null;
                    break;
                case "Menu":
                    Menu = original.Menu;
                    original.Menu = null;
                    break;
                case "NewtonAdapter":
                    NewtonAdapter = original.NewtonAdapter;
                    original.NewtonAdapter = null;
                    break;
                default:
                    break;
            }
        }
    }

};

module.exports = Session;
