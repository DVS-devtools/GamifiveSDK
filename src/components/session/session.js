var Promise   = require('promise-polyfill');
var API = require('../api/api');
var Constants = require('../constants/constants');
var DOMUtils  = require('../dom/dom-utils');
var GameInfo  = require('../game_info/game_info');
var Location  = require('../location/location');
var Logger    = require('../logger/logger');
var Menu      = require('../menu/menu');
var Network   = require('../network/network');
var User      = require('../user/user');
var VHost     = require('../vhost/vhost');
var Stargate  = require('stargatejs');

var NewtonService = require('../newton/newton');
import Facebook from '../fb/fb';
import Event from '../event/event';
import { Utils } from 'stargatejs';
import { calculateContentRanking } from '../tracking_utils/tracking_utils';
const { getType } = Utils;

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
    var startCallback = function(){};
    var contentRanking;

    var config = {};
    
    //[[GET, url]]
    var toDoXHR = [];
    /**
    * returns whether Session has already been initialized
    * @function isInitialized
    * @memberof Session
    */
    this.isInitialized = function(){
        return initialized;
    };

    /**
    * resets the internal configuration to default value
    * @function reset
    * @memberof Session
    */
    this.reset = function(){
        initPromise = null;
        config = {sessions:[]};
    };
    // apply default configuration
    sessionInstance.reset();

    /**
    * returns the internal configuration
    * @function getConfig
    * @memberof Session
    */
    this.getConfig = function(){        
        return config;
    };

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

        if (initPromise){
            initPromise.then(callback)
        } else {
            throw new Error(Constants.ERROR_SESSION_INIT_NOT_CALLED);
        }
    };

    /**
    * initializes the module with custom parameters
    * @function init
    * @memberof Session
    * @param {Object} params - can contain "lite" (boolean) attribute
    * @param {Boolean} params.lite
    * @param {Boolean} params.debug 
    */
    this.init = function(params){
        if(process.env.NODE_ENV === "debug"){
            Logger.warn("GFSDK: Running in debug mode!")
        }
        
        if (!params){
            params = {};
        }

        Logger.info('GamifiveSDK', 'Session', 'init', params);

        // convert it if it's a number
        if(getType(params.lite) === 'number'){
            params.lite = !!params.lite;
        }

        if (typeof params.lite !== 'undefined' && typeof params.lite !== 'boolean'){
            throw Constants.ERROR_LITE_TYPE + typeof params.lite;
        }

        config = Utils.extend(config, params);

        if (typeof config.moreGamesButtonStyle !== 'undefined'){
            Menu.setCustomStyle(config.moreGamesButtonStyle);
        }

        Menu.setGoToHomeCallback(sessionInstance.goToHome);
        
        var SG_CONF = {};
        // let's dance     
        if (Stargate.isHybrid() 
            && window.location.protocol === 'cdvfile:'){ 
            // added for retro compatibility: 
            // game module should not be initialized in old hybrid app without offline
            SG_CONF = {
                modules:[
                    ['game', {
                        sdk_url: '',  
                        api: '',
                        gamifive_info_api: '', 
                        bundle_games: []
                        }
                    ]
                ]
            };
        }

        initPromise = Stargate.initialize(SG_CONF)
               .then(function(){
                   return VHost.load();
               })
               .then(function(){

                    Menu.setSpriteImage(VHost.get('IMAGES_SPRITE_GAME'));
                    contentRanking = VHost.get('CONTENT_RANKING');
                    Menu.show();
                
                    var UserTasks = User.fetch().then(User.getFavorites);                                   
                    return Promise.all([
                        UserTasks,
                        GameInfo.fetch()
                    ]);
               })
               .then(function(){
                    Facebook.init({ fbAppId: GameInfo.getInfo().fbAppId });
                    
                    var env = Stargate.isHybrid() ? 'hybrid' : 'webapp';
                    var enableNewton = true;

                    NewtonService.init({
                           secretId: VHost.get('NEWTON_SECRETID'),
                           enable: enableNewton, // enable newton
                           waitLogin: true,     // wait for login to have been completed (async)
                           logger: Logger,
                           properties: {
                                environment: env,
                                white_label_id: GameInfo.getInfo().label
                           }
                    });

                    var queryString = Location.getQueryString();
                    if (typeof queryString.dest === 'undefined'){
    					queryString.dest = 'N/A';                        
                    }

                    queryString.http_referrer = window.document.referrer;
                    NewtonService.login({
                        type: 'external',
                        userId: User.getUserId(), 
                        userProperties: queryString,
                        logged: (User.getUserType() !== 'guest')
                    });

                    NewtonService.trackEvent({
                        name: 'SdkInitFinished',
                        rank: calculateContentRanking(GameInfo, User, VHost, 'Play', 'GameLoad'), 
                        properties:{
                            action: 'Yes',
                            category: 'Play',
                            game_title: GameInfo.getInfo().game.title,
                            label: GameInfo.getContentId(),
                            valuable: 'Yes'                            
                        }
                    });           
                    initialized = true;  
                    return initialized;                    
               }).then(function(){  
                   Logger.log('GamifiveSDK', 'register sync function for gameover/leaderboard results');
                   Stargate.addListener('connectionchange', sync);                   
                   Event.trigger('INIT_FINISHED');
               }).catch(function(reason){
                    Event.trigger('INIT_ERROR', reason);
                    Logger.error('GamifiveSDK init error: ', reason);
                    initialized = false;
                    throw reason;
               });

        return initPromise; 
    };

    var getLastSession = function(){
        return config.sessions[0];
    };

    function sync(networkStatus){
        if(networkStatus.type === 'online'){
            if(toDoXHR.length === 0){ Logger.log('No xhr to sync', toDoXHR); return;}
            Logger.log('Try to sync', toDoXHR);
            var promiseCallsList = toDoXHR.map(function(todo, index, arr){
                return Network.xhr(todo[0], todo[1]);
            });

            Promise.all(promiseCallsList)
                .then(function(results){
                    // filtering results, get the unsuccess calls indexes
                    return results
                        .map(function(element, index){if(!element.success) return index; })
                        .filter(function(index){ if(index !== undefined){ return true;} });

                }).then(function(indexesToRetain){
                    Logger.log('before toDoXHR list', toDoXHR);
                    // retain because they failed
                    var toRetain = indexesToRetain.map(function(index){ return toDoXHR.slice(index, index + 1) });

                    toDoXHR = toRetain.reduce(function(prev, current){ return prev.concat(current) }, []);
                    Logger.log('after toDoXHR list', toDoXHR);
                });
        }
    }

    /**
    * starts a new gameplay session
    * @function start
    * @access private
    * @memberof Session
    */
    function __start(){
        Logger.info('GamifiveSDK', 'Session', 'start');

        Menu.hide();

        function doStartSession(){            
            NewtonService.trackEvent({
                name: "GameStart",
                rank: calculateContentRanking(GameInfo, User, VHost, 'Play', 'GameStart'), 
                properties:{
                    category: "Play", 
                    label: GameInfo.getContentId(),
                    valuable: "Yes",
                    action: "Yes"                    
                }
            });
            
            try{
                startCallback();
            } catch(e){
                Logger.error('GamifiveSDK', 'onStartSession ERROR', e);
            }                        
        }

        if (!config.lite){     
            
            User.canPlay()
                .then(function(canPlay){
                    if(canPlay){
                        // clear dom
                        DOMUtils.delete();
                        doStartSession();
                    } else {
                        // Call the paywall instead?
                        return gameOver({ start: 0, duration: 0, score: 0, level: 0 });
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
        
        // If a previous session exists, it must have been ended
        if (config.sessions && config.sessions.length > 0 && typeof getLastSession().endTime === 'undefined'){
            config.sessions.shift();
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

        return initPromise.then(function(){
            return __start();
        });
    };

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
            throw new Error(Constants.ERROR_ONSTART_CALLBACK_TYPE + typeof callback);
        }
    };

    /**
    * sets a callback function to be called when the game enters pause status
    * @function onPauseEnter
    * @memberof Session
    * @param {function} callback the function to be called when the game pauses
    */
    this.onPauseEnter = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseEnter');
        Menu.show();
    };

    /**
    * sets a callback function to be called when the game exits pause status
    * @function onPauseExit
    * @memberof Session
    * @param {function} callback the function to be called when the game resumes
    */
    this.onPauseExit = function(callback){
        Logger.log('GamifiveSDK', 'Session', 'onPauseExit');
        Menu.hide();
    };

    /**
    * ends a session and (if not in lite mode) shows the platform's gameover screen    
    * @function end
    * @memberof Session
    * @param {Object} data can contain a "score" and/or "level" attribute
    * @param {Number} data.score - the score of the user in the sesssion
    * @param {Number} data.level - the level
    */
    this.end = function(data){        
        Logger.info('GamifiveSDK', 'Session', 'end', data);
        
        if (!initPromise){
            throw Constants.ERROR_SESSION_INIT_NOT_CALLED;
        }
        // set default object
        // data = data ? data : {};
        var dataTypeCheck = getType(data);
        if (dataTypeCheck === 'undefined' || dataTypeCheck === 'null'){
            throw new Error(Constants.ERROR_END_SESSION_PARAM + dataTypeCheck);
        }

        if (config.sessions.length < 1){
            throw Constants.ERROR_SESSION_NO_SESSION_STARTED;
        }

        if (getType(getLastSession().endTime) !== 'undefined'){
            throw Constants.ERROR_SESSION_ALREADY_ENDED;
        }

        NewtonService.trackEvent({
            rank: calculateContentRanking(GameInfo, User, VHost, 'Play', 'GameEnd'),
            name:'GameEnd', 
            properties:{
                category: 'Play',
                label: GameInfo.getContentId(),
                valuable: 'No',
                action: 'No'                
            }
        });

        getLastSession().endTime = new Date();

        if (data.hasOwnProperty('score')){
            if (getType(data.score) === 'number'){
                getLastSession().score = data.score;                
            } else {
                throw new Error(Constants.ERROR_SCORE_TYPE + getType(data.score));            
            }
        } else {
            throw new Error("GamifiveSDK :: score is mandatory!");
        }

        if (data.hasOwnProperty('level')){
            if (getType(data.level) === 'number'){
               getLastSession().level = data.level;
            } else {
                throw Constants.ERROR_LEVEL_TYPE + getType(data.level);
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
	      		'userId': User.getUserId(),
                'format': 'jsonp'
			};

			if (typeof lastSession.level !== 'undefined'){
				leaderboardParams.level = lastSession.level;
			}            
           
            var leaderboardCallUrl = API.get('LEADERBOARD_API_URL');
            leaderboardCallUrl = Utils.queryfy(leaderboardCallUrl, leaderboardParams);
            
            Logger.log("Leaderboard ", leaderboardCallUrl);            
            
            if (Stargate.checkConnection().type === 'online'){
                Network.xhr('GET', leaderboardCallUrl);
            } else {
                enqueue('GET', leaderboardCallUrl);
            }

        } else {           
            // call gameover            
            var gameoverParams = {
                start: lastSession.startTime.getTime(),
                duration: lastSession.endTime - lastSession.startTime,
                score: lastSession.score                           
            };

            if(lastSession.level){
                gameoverParams.level = lastSession.level;
            }            
            
            gameOver(gameoverParams)
                .then(DOMUtils.create)
                .then(function(){
                    // attach listener to back button
                    
                    if(document.querySelector(Constants.BACK_BUTTON_SELECTOR)){
                        var toHomeBtn = document.querySelector(Constants.BACK_BUTTON_SELECTOR).parentNode;
                        
                        toHomeBtn.addEventListener('touchend', function(e){
                            e.stopPropagation();
                            e.preventDefault();
                            sessionInstance.goToHome();
                            //remove it everytime to prevent memory leak
                            toHomeBtn.removeEventListener(this);
                        });
                    }

                    // disabled false
                    var state = Stargate.checkConnection().type === 'online' ? false : true;
                    var buttons = document.querySelectorAll('.social .btn');
                    	
                    buttons = [].slice.call(buttons);
                    buttons.map(function(button){ button.disabled = state; });

                    Stargate.addListener('connectionchange', function(conn){
                        var state;
                        conn.type === 'online' ? state = false : state = true;					
                        buttons.map(function(button){ button.disabled = state; })
                    });
                    var isFav = User.isGameFavorite(GameInfo.getContentId());
                    DOMUtils.updateFavoriteButton(isFav);
                });  
        }

        Menu.show();
    };

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
        Logger.log('Gameover ', url);        

        if (Stargate.checkConnection().type === "online"){
            return Network.xhr('GET', url).then(function(resp) {
                if(Stargate.isHybrid() && window.location.protocol === 'cdvfile:'){
                    gameoverParams.content_id = GameInfo.getContentId();
                    return Stargate.game.buildGameOver(gameoverParams);
                }
                return resp.response;
            });
        } else if(Stargate.checkConnection().type === "offline" && Stargate.isHybrid()){

            gameoverParams.content_id = GameInfo.getContentId();
            enqueue('GET', url);
            return Stargate.game.buildGameOver(gameoverParams);
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
            // In local index there's already a connection check
            Stargate.goToLocalIndex();            
        } else {
            window.location.href = Location.getOrigin();
        }
    };

    function persistXHR(){
        if(Stargate.isHybrid()){
            var TODO_XHR_PATH = [Stargate.file.BASE_DIR, 'toDoXHR.json'].join('');
            return Stargate.file.write(TODO_XHR_PATH, JSON.stringify(toDoXHR));
        }
    }

    /**
     * Save the call for later
     */
    function enqueue(method, url){
        var saved = ['GET', url];
        Logger.info(saved, ' save the call for later');
        toDoXHR.push(saved);
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
                    original.User = require('../user/user');
                    User = mock;
                    break;
                case "Stargate":
                    original.Stargate = require('stargatejs');
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
                case "NewtonService":
                    original.NewtonService = require('../newton/newton');
                    NewtonService = mock;
                    break;
                default:
                    break;
            }
        };

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
                case "NewtonService":
                    NewtonService = original.NewtonService;
                    original.NewtonService = null;
                    break;
                default:
                    break;
            }
        }
    }

};

module.exports = Session;