/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var config = {};
	var sdkInstance = this;
	var Utils = GamifiveSDKUtils;
	var moreGamesLink;
	// will hold a reference to Dixie storage or debug mode storage

    if (typeof storage === 'undefined' && typeof Dixie !== 'undefined'){
        window.storage = new Dixie();
        window.storage.init({type: 'localStorage'});
    }

	// default key for guest (unknown) user's data
	var userStatusKey = 'GamifiveSDKStatus_unknown';
    var GA_FOR_GAME_JSON_URL = 'http://www2.gameasy.com/ww-it/ga_for_games.js?print_json_response=1';

    var STARGATE_BASE_DIR; // this will be initialized after Stargate initialization

    this.getStargateBaseDir = function(){
        return STARGATE_BASE_DIR;
    }

	/********************************************
	*****  EXTERNAL METHODS FOR DEVELOPERS  *****
	********************************************/

    var getUserData = function(callback){
        var getUserDataUrl = MOA_API_APPLICATION_OBJECTS_GET;

        var userDataId = '';
        try {
            //userDataId = config.user.gameInfo._id;
        } catch (err){
            // does not exist
        }

        getUserDataUrl = getUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: config.contentId}))
                            .replace(':ID', userDataId)
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', config.userId)
                            .replace(':COLLECTION', 'gameInfo') // from vh?

        // unique parameter in qs to avoid cache
        getUserDataUrl += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);

        Utils.xhr('GET', getUserDataUrl, function(resp, req){
            console.log("GamifiveSDK :: fetch UserData", resp);
            // save into config
            var toParse = resp.response.data[0];
           	if (!!toParse && typeof toParse.info !== 'undefined') {
                toParse.info = JSON.parse(toParse.info);
            }
            config.user.gameInfo = toParse;
            if (typeof callback === 'function') callback(toParse ? toParse.info : null);
        });
    }

    /**
    * Returns the user data for this game
    * @function loadUserData
    * @memberof Gfsdk
    */
    this.loadUserData = function(callback){
        if (!config.debug && MOA_API_APPLICATION_OBJECTS_GET.length > 0){

            if (window.location.href.indexOf('cdvfile') < 0){
                 getUserData(callback);
            }

            try {
                var toReturn = config.user.gameInfo;

                if (typeof GamifiveSDKOffline !== 'undefined'
                        && typeof GamifiveSDKOffline.data !== 'undefined'
                        && typeof GamifiveSDKOffline.data.game_info !== 'undefined'){

                    var gameInfoOffline = GamifiveSDKOffline.getGamifiveInfo(config.content_id).gameInfo;
                    if (gameInfoOffline.UpdatedAt > toReturn.UpdatedAt){
                        console.log("getting offline data");
                        toReturn.info = gameInfoOffline.info;
                        toReturn.UpdatedAt = gameInfoOffline.UpdatedAt;
                    }
                }

                return toReturn.info;
            } catch (err){
                console.warn("GamifiveSDK :: loadUserData :: No cached data to return")
                return null;
            }
        } else {
            var toReturn = window.storage.get(userStatusKey);
            if (typeof callback == 'function'){
                callback(toReturn);
            }
            return toReturn;
        }
    }

    var setUserData = function(dataToSave, callback){

        var setUserDataUrl, userDataId;
        var dataToSaveAsJSON = JSON.stringify(dataToSave);

        var setUserDataParams = function(){
            setUserDataUrl = MOA_API_APPLICATION_OBJECTS_SET;

            userDataId = '';
            try {
                userDataId = config.user.gameInfo._id;
            } catch (err){
                // does not exist, keep default
            }

            setUserDataUrl = setUserDataUrl
                                .replace(':QUERY', JSON.stringify({contentId: config.contentId}))
                                .replace(':ID', userDataId)
                                .replace(':ACCESS_TOKEN', '')
                                .replace(':EXTERNAL_TOKEN', config.userId)
                                .replace(':COLLECTION', 'gameInfo');

            setUserDataUrl += "&info=" + encodeURIComponent(dataToSaveAsJSON)
                                + "&domain=" + encodeURIComponent(Utils.getAbsoluteUrl())
                                + "&contentId=" + config.contentId;
        }

        if (window.location.href.indexOf('cdvfile') < 0){

            getUserData(function(){
                setUserDataParams();
                Utils.xhr('POST', setUserDataUrl, function(resp, req){
                    if (typeof callback === 'function') callback();
                });
            });
        } else {
            setUserDataParams();

            // local save in volatile variable
            config.user.gameInfo.info = dataToSave;
            var nowDate = new Date();
            config.user.gameInfo.UpdatedAt = nowDate;

            var offlineGamifiveInfo = GamifiveSDKOffline.getGamifiveInfo(config.content_id);
            offlineGamifiveInfo.gameInfo = config.user.gameInfo;
            for (var key in offlineGamifiveInfo){
                window.GamifiveInfo[key] = offlineGamifiveInfo[key];
            }
            GamifiveSDKOffline.enqueue(GamifiveSDKOffline.XHR_QUEUE, {method: 'POST', url: setUserDataUrl});
            if (typeof callback === 'function') callback();
        }

    }

    /**
    * Saves an object to record the status of the game
    * @function saveUserData
    * @memberof Gfsdk
    */
    this.saveUserData = function(obj, callback){
        if (!config.debug && MOA_API_APPLICATION_OBJECTS_SET.length > 0){
            setUserData(obj, callback);
        } else {
            window.storage.set(userStatusKey, obj);
            if (typeof callback == 'function'){
                callback();
            }
        }
    }

    /**
    * Deletes the status of the game
    * @function clearStatus
    * @memberof Gfsdk
    */
    this.clearUserData = function(){
        if (!config.debug && MOA_API_APPLICATION_OBJECTS_SET.length > 0){
            setUserData(null);
        } else {
            window.storage.set(userStatusKey, null);
        }
    }

	/**
	* Reset GamefiveSDK
	* @function reset
	* @memberof Gfsdk
	*/
	this.reset = function(){
		config = {};
	}

    // provvisorio
    var getGamifiveInfoAPI = function(callback){
        var gpparams = {content_id: config.content_id};

        if (window.location.href.indexOf('cdvfile') > -1){

            var connectionTest = Stargate.checkConnection();

            if (connectionTest.type !== 'offline'){
                Utils.xhr('JSONP', API('gameplay_proxy', gpparams) + config.user.ponyUrl, function(resp, req){
                    if (callback){
                        callback(resp);
                    }
                });
            } else {
                callback({game_info: GamifiveSDKOffline.getGamifiveInfo(config.content_id)}); // offline saved version
            }
        }

    }
    this.getGamifiveInfoAPI = getGamifiveInfoAPI;

	/**
	* Init GamefiveSDK
	* @function init
	* @memberof Gfsdk
	* @param {object} param - configuration
	* @param {boolean} [param.debug] - Set debug mode
	* @param {boolean} [param.log] - Enable/disable logging
	* @param {boolean} [param.lite] - If true SDK doesn't implement GameOver status
	* @param {object} [param.moreGamesButtonStyle] - optional style for More Games button element
	*/
	var doInit = function(param){
		// get param
		Utils.copyProperties(param, config);

        GameOverCore.initializeAPIUrls();

		// enable/disable debug
		if(localStorage.getItem('log') == 1){
			Utils.enableLog(true);
		} else {
			Utils.enableLog(!!config.log);
		}

		var initPost = function(){
			if(!config.lite){
				// init events array
				config.events = {};

				// set facebook appId and init facebook
				FBConnector.setConfig('appId', config.fbAppId);
				FBConnector.start();

				// add listeners of gameover
				GameOverCore.addListeners();

				// control if user is fb connected
				GamefiveSDK.controlFbConnected();
			}

			Utils.log("GamifiveSDK", "init", config);
		}

		var trackGameLoad = function(){
			var gameTitle = config.game.title;
			if (!gameTitle){
				Utils.log("GamifiveSDK", "trackGameLoad", "game title is not defined");
			}

			tryAnalyticsTrackEvent('Play', 'GameLoad', config.contentId, { game_title: gameTitle, valuable_cd: 'Yes', action_cd: 'Yes' });
			tryNewtonTrackEvent({
				category: 'Play',
				action: 'GameLoad',
				game_title: gameTitle,
				label: config.contentId,
				valuable_cd: 'Yes',
				action_cd: 'Yes'
			});
		}

        // mocks for debug and hybrid-offline
        if (typeof tryNewtonTrackEvent === 'undefined'){
            // mock tryNewtonTrackEvent and tryAnalyticsTrackEvent
            window.tryNewtonTrackEvent = function(){
                Utils.log(arguments);
            };
        }

        if (typeof tryAnalyticsTrackEvent === 'undefined'){
            window.tryAnalyticsTrackEvent = function(){
                Utils.log(arguments);
            };
        }

		// get window.GamifiveInfo
		if(!config.debug){
			// get storage from ga_for_games (Dixie)
			var _copyInfo = function(){
				Utils.copyProperties(window.GamifiveInfo, config);
				try {
					config.user.gameInfo.info = JSON.parse(config.user.gameInfo.info);
				} catch (err) {}

				if (typeof config.user != 'undefined'){
					config.user.userGuest = !config.user.userFreemium && !config.user.userId;
				}
				if (config && config.user && config.user.userId){
					userStatusKey = "GamifiveSDKStatus_" + config.user.userId;
				}

				// from ga_for_game
				config.CHALLENGE_MESSAGE = CHALLENGE_MESSAGE;
				config.MESSAGE_ERROR = MESSAGE_ERROR;
				config.MESSAGE_ERROR_TITLE = MESSAGE_ERROR_TITLE;

				initPost();
				trackGameLoad();
			}

			if (typeof window.GamifiveInfo !== 'undefined'){
				_copyInfo();
			} else {
				getGamifiveInfoAPI(function(data){
                    console.log("GameInfo", data);
                    window.GamifiveInfo = data.game_info;

                    GamifiveSDKOffline.setGamifiveInfo(config.content_id, data.game_info);
                    _copyInfo();
                });
			}

		} else {
            window.MOA_API_APPLICATION_OBJECTS_SET = '';
            window.MOA_API_APPLICATION_OBJECTS_GET = '';

            // mock sprite more games button
			moreGamesButtonSprite = 'http://s.motime.com/img/wl/webstore_html5game/images/gameover/sprite.png?v=20151120101238';

			// debug mode: Dixie is not defined, use a mock
		    window.storage = new function(){
		        this.set = function(key, obj){
		            localStorage.setItem(key, JSON.stringify(obj));
		        }
		        this.get = function(key){
		            return JSON.parse(localStorage.getItem(key));
		        }
		        this.delete = function(key){
		            localStorage.removeItem(key);
		        }
		    }

			config.CHALLENGE_MESSAGE = 'You successfully invited your friends!';
			config.MESSAGE_ERROR = 'Error!';
			config.MESSAGE_ERROR_TITLE = 'Something went wrong';

			// For this one, offline mode can be ignored (this branch of the if won't be executed, in hybrid)
			Utils.xhr('GET', API('gamifiveinfo'), function(resp, req){
				Utils.copyProperties(resp, config);
				initPost();
				trackGameLoad();
				config.user.level = parseInt(localStorage.getItem(config.user.userId + ":" + config.contentId));
			});
		}

		setTimeout(function(){
			if (!!config.moreGamesButtonStyle) {
				sdkInstance.showMoreGamesButton(config.moreGamesButtonStyle);
			};
		}, 1000);

	}

    this.init = function(param){

        if (window.location.href.indexOf('cdvfile') > -1){
            var gameplayDirPrefix = 'games';
            var rx = new RegExp('<PREFIX>/([a-z0-9]+)/'.replace('<PREFIX>', gameplayDirPrefix));
            config.content_id = window.location.pathname.match(rx)[1];
            console.log("GamifiveSDK :: setting content_id");
        }

        if (window.location.href.indexOf('cdvfile') > -1){
            var stargateInitConf = {
                "modules": [
                    "game"
                ],
                "modules_con":{
                    game:{}
                }
            };
            Stargate.initialize(stargateInitConf).then(function(){

                document.addEventListener('pause', function(){
                    Utils.log("Pause event triggered :: persisting offline data");
                    GamifiveSDKOffline.persist();
                });

                Utils.log("GamifiveSDK :: Stargate initialized");
                STARGATE_BASE_DIR = Stargate.game.BASE_DIR;

                GamifiveSDKOffline.load(function(){
                    var fileNames = ['user.json', 'config.json', 'dict.json', 'cookie.json'];
                    var filePromises = [];

                    for (var i=0; i<fileNames.length; i++){
                        filePromises.push(Stargate.file.readFileAsJSON(STARGATE_BASE_DIR + fileNames[i]));
                    }

                    Promise.all(filePromises).then(function(results){

                        var additionalInfo = {};
                        window.getAdditionalInfo = function(){
                            return additionalInfo;
                        }

                        // get user info
                        var userResp = results[0];
                        if (typeof config.user === 'undefined'){
                            config.user = {};
                        }
                        for (var userKey in userResp){
                            config.user[userKey] = userResp[userKey];
                        }

                        // save config keys
                        var configResp = results[1];
                        var configKeysToSave = [
                            'SERVICE_TITLE',
                            'ALL_FREE_FOR_GUEST',
                            'CAT_TRACKING_URL',
                            'NEWTON_APPID',
                            'NEWTON_SECRETID',
                            'NEWTON_URL',
                            'COOKIE_GUESTUSER_DATA',
                            'MOA_API_APPLICATION_OBJECTS_GET',
                            'MOA_API_APPLICATION_OBJECTS_SET'
                        ]
                        var tempConfig = {};
                        var key;
                        for (var i=0; i<configKeysToSave.length; i++){
                            key = configKeysToSave[i];
                            tempConfig[key] = configResp[key]
                        }
                        delete key;

                        // save dict keys
                        var dictResp = results[2];
                        var dictKeysToSave = [
                            'DIZIONARIO_WEBAPP_FBCHALLENGE_INVITES_OK_MESSAGE_SINGLE',
                            'DIZIONARIO_WEBAPP_ERROR_GENERIC_MESSAGE',
                            'DIZIONARIO_WEBAPP_ERROR_GENERIC_TITLE'
                        ]
                        var tempDict = {};
                        var key;
                        for (var i=0; i<dictKeysToSave.length; i++){
                            key = dictKeysToSave[i];
                            tempDict[key] = dictResp[key]
                        }
                        delete key;

                        window.guestDataVar = tempConfig.COOKIE_GUESTUSER_DATA;
                        delete tempConfig.COOKIE_GUESTUSER_DATA;

                        window.MOA_API_APPLICATION_OBJECTS_GET = tempConfig.MOA_API_APPLICATION_OBJECTS_GET;
                        delete tempConfig.MOA_API_APPLICATION_OBJECTS_GET;

                        window.MOA_API_APPLICATION_OBJECTS_SET = tempConfig.MOA_API_APPLICATION_OBJECTS_SET;
                        delete tempConfig.MOA_API_APPLICATION_OBJECTS_SET;

                        window.MESSAGE_ERROR = tempDict.DIZIONARIO_WEBAPP_ERROR_GENERIC_MESSAGE;
                        delete tempDict.DIZIONARIO_WEBAPP_ERROR_GENERIC_MESSAGE;

                        window.MESSAGE_ERROR_TITLE = tempDict.DIZIONARIO_WEBAPP_ERROR_GENERIC_TITLE;
                        delete tempDict.DIZIONARIO_WEBAPP_ERROR_GENERIC_TITLE;

                        window.CHALLENGE_MESSAGE = tempDict.DIZIONARIO_WEBAPP_FBCHALLENGE_INVITES_OK_MESSAGE_SINGLE;
                        delete tempDict.DIZIONARIO_WEBAPP_FBCHALLENGE_INVITES_OK_MESSAGE_SINGLE;

                        for (var key in tempConfig){
                            additionalInfo[key] = tempConfig[key];
                        }
                        for (var key in tempDict){
                            additionalInfo[key] = tempDict[key];
                        }

                        // save cookies
                        var cookieResp = results[3];
                        var cookieStorage = new Dixie();
                        cookieStorage.init({type: 'cookie'});
                        for (var key in cookieResp){
                            cookieStorage.set(key, cookieResp[key], 7);
                        }

                        var processGaForGames = function(resp){

                            additionalInfo.operator = resp.OPERATOR;
                            additionalInfo.tld = resp.TLD;
                            additionalInfo.userid = resp.USERID;
                            additionalInfo.md5userid = resp.MD5USERID;
                            additionalInfo.msisdn = resp.USERID;
                            additionalInfo.subscribed = resp.BILLING_STATUS;
                            additionalInfo.data_iscr = resp.DATA_ISCR;
                            additionalInfo.socialnetwork = resp.SOCIAL_NET_SOURCE;

                            window.moreGamesButtonSprite = resp.IMAGES_sprite_game;
                            window.isMobile = resp.IS_SMARTPHONE;

                            doInit(param);
                        }

                        var checkedConnection = Stargate.checkConnection();
                        if (checkedConnection.type == 'offline'){
                            var ga_for_game_data = GamifiveSDKOffline.getGaForGameJSON(config.content_id);
                            processGaForGames(ga_for_game_data);
                        } else {
                            Utils.xhr('JSONP', GA_FOR_GAME_JSON_URL + config.user.ponyUrl, function(resp, req){
                                GamifiveSDKOffline.setGaForGameJSON(config.content_id, resp);
                                processGaForGames(resp);
                            });
                        }

                    }).catch(function(promiseError){
                        console.error(promiseError);
                    });
                });

            });
        } else {
            doInit(param);
        }
    }


	/**
	* Set callback used after startSession
	* @function onStartSession
	* @memberof Gfsdk
	* @param {function} callback
	*/
	this.onStartSession = function(callback) {
		Utils.log("GamifiveSDK", "onStartSession", callback);

		// ERROR HANDLING
		if(!config.lite){
			if (callback && typeof(callback) == 'function'){
				// set callback in config
				config.startCallback = callback;
				Utils.debug("GamifiveSDK", "OK", "callback function has been set correctly");
			} else {
				Utils.error("GamifiveSDK", "ERROR", "missing or illegal value for callback function");
			}
		} else {
			Utils.error("GamifiveSDK", "ERROR", "in lite mode, onStartSession must not be used");
		}
	}

	this.startSession = function() {
		Utils.log("GamifiveSDK", "startSession");

		sdkInstance.hideMoreGamesButton();

		// set time start
		config.timestart = Utils.dateNow();



		if(!config.lite){

            if (window.location.href.indexOf('cdvfile') < 0){
                // branch: offline and online mode
                Utils.xhr('GET', API('canDownload'), function(resp, req){
                    Utils.log("GamifiveSDK", "startSession", "canDownload", resp, req);

                    if(resp.canDownload){
                        // clear dom
                        sdkElement.delete();

                        // call onStartSession callback
                        if(!!config.startCallback){
                            config.startCallback.call();
                        }
                    } else {
                        // call gameover API
                        Utils.xhr('GET', API('gameover'), function (resp, req) {
                            // render page with resp
                            sdkElement.create(resp);

                            // throw event 'user_no_credits'
                            throwEvent('user_no_credits');
                        });
                    }
                });
            } else {
                sdkElement.delete();

                // call onStartSession callback
                if(!!config.startCallback){
                    config.startCallback.call();
                }
            }

		}

		// ERROR HANDLING
		if (!!config.contentId){
			Utils.debug("GamifiveSDK", "OK", "init has been called correctly");
		} else {
			Utils.error("GamifiveSDK", "ERROR", "init has not been called");
		}

		if(!config.lite){
			if (config.startCallback && typeof(config.startCallback) == 'function'){
				Utils.debug("GamifiveSDK", "OK", "onStartSession has been called correctly");
			} else {
				Utils.error("GamifiveSDK", "ERROR", "onStartSession has not been called");
			}
		}

		console.log("gamestart", {
			category: 'Play',
			action: 'GameStart',
			game_title: config.game.title,
			label: config.contentId,
			valuable_cd: 'Yes',
			action_cd: 'Yes'
		})
		// TRACKING
		tryAnalyticsTrackEvent('Play', 'GameStart', config.contentId, { game_title: config.game.title, valuable_cd: 'Yes', action_cd: 'Yes' });
		tryNewtonTrackEvent({
			category: 'Play',
			action: 'GameStart',
			game_title: config.game.title,
			label: config.contentId,
			valuable_cd: 'Yes',
			action_cd: 'Yes'
		});
	}

	/**
	* End session
	* @function endSession
	* @memberof Gfsdk
	* @param {object} param - parameters for game over api
	* @param {float} [param.score] - final score of player
	*/
	this.endSession = function(param){
		Utils.log("GamifiveSDK", "endSession", param);

		// show it ONLY if it was previously created
		if (moreGamesLink){
			sdkInstance.showMoreGamesButton(customStyle);
		}

		// set time end
		config.timeend = Utils.dateNow();

		// set score
		if(typeof param.score == 'number'){
			config.score = parseFloat(param.score);
		}

		if (!!param.level){
			config.user.level = parseInt(param.level);
			if (config.debug){
				localStorage.setItem( config.user.userId + ":" + config.contentId, parseInt(config.user.level));
			}
		}

		if(!config.lite){

			var queryParams = {
				'start': config.timestart,
				'duration': config.timeend - config.timestart,
				'score': config.score
			};

			// get challenge id
			if(!!config.challenge && !!config.challenge.id){
				queryParams.challenge_id = config.challenge.id;
			}

			if (typeof config.user.level != 'undefined'){
				queryParams.level = config.user.level;
			}

			// call gameover API
			if (window.location.href.indexOf('cdvfile') === -1){
                Utils.xhr('GET', API('gameover', queryParams), function (resp, req) {
    				// render page with resp
    				sdkElement.create(resp);
    				if (!config.debug && !getAdditionalInfo().guest) {
    					GameOverCore.initializeLike();
    				};
    			});
            } else {
                queryParams.content_id = config.content_id;
                Stargate.game.buildGameOver(queryParams)
                    .then(function(data){
                        console.log("Build gameover with Stargate", data);
                        sdkElement.create(data);
                        var homeBtn = document.querySelectorAll('.logo')[0];
                        homeBtn.addEventListener('touchend',GamifiveSDK.goToHome);
                    });
            }

		} else {

			var queryParams = {
				'start': config.timestart,
				'duration': config.timeend - config.timestart,
				'score': config.score,
	      		'newapps': 1,
	      		'appId': config.contentId,
	      		'label': config.label,
	      		'userId': config.userId
			};

			if (typeof config.user.level != 'undefined'){
				queryParams.level = config.user.level;
			}

            var leaderboardCallUrl = API('leaderboard', queryParams);
            if (window.location.href.indexOf('cdvfile') === -1){
    			Utils.xhr('GET', leaderboardCallUrl);
            } else {
                GamifiveSDKOffline.enqueue(GamifiveSDKOffline.XHR_QUEUE, {method: 'GET', url: leaderboardCallUrl})
            }
		}

		// ERROR HANDLING
		if (config.timestart && typeof(config.timestart) == 'number'){
			Utils.debug("GamifiveSDK", "OK", "startSession has been called correctly");
		} else {
			Utils.error("GamifiveSDK", "ERROR", "startSession has not been called");
		}

		if (typeof config.score !== 'undefined'){
			if (typeof(config.score) == 'number'){
				Utils.debug("GamifiveSDK", "OK", "score has been set correctly");
			} else {
				Utils.error("GamifiveSDK", "ERROR", "illegal score value type");
			}
		}

		config.timestart = null;

		// TRACKING
		tryAnalyticsTrackEvent('Play', 'GameEnd', config.contentId, { game_title: config.game.title, valuable_cd: 'No', action_cd: 'No' });
		tryNewtonTrackEvent({
			category: 'Play',
			action: 'GameEnd',
			game_title: config.game.title,
			label: config.contentId,
			valuable_cd: 'No',
			action_cd: 'No'
		});
	}

	/**
	* Go to Homepage and track this event on Newton and Analytics
	*/
	this.goToHome = function(e){

        if (e){
            e.preventDefault();
        }

    	Utils.log("GamifiveSDK", "Go To Homepage", document.location.origin);
    	tryAnalyticsTrackEvent('Behavior', 'MoreGames', config.contentId,
    		{
    			game_title: config.game.title,
    			valuable_cd: 'No',
    			action_cd: 'yes'
    		}
    	);
    	tryNewtonTrackEvent({
			category: 'Behavior',
			action: 'MoreGames',
			game_title: config.game.title,
			label: config.contentId,
			valuable_cd: 'No',
			action_cd: 'Yes'
		});

        if (window.location.href.indexOf('cdvfile') < 0){
            document.location.href = Utils.getAbsoluteUrl();
        } else {
            GamifiveSDKOffline.persist(function(){
               Stargate.goToLocalIndex();
            });
        }

    };

	/**
	* Shows the "More Games" icon.
	* By clicking on this button the user will be redirected to the homepage.
	*/
	var customStyle;

	this.showMoreGamesButton = function(style){

        if (typeof moreGamesButtonSprite === 'undefined') return;

        if (!moreGamesLink){
        	moreGamesLink = document.createElement('a');

	        // assign the outgoing click
	        moreGamesLink.addEventListener('touchend', sdkInstance.goToHome, false);
	        moreGamesLink.addEventListener("click", sdkInstance.goToHome, false);
	        moreGamesLink.setAttribute("id", "gfsdk-more-games");
	        document.body.appendChild(moreGamesLink);

		}

		var defaultStyle = {};
		// default style
		defaultStyle.left = '2px' ;
		defaultStyle.height = '44px';
		defaultStyle['background-position'] = '-22px -428px';
		defaultStyle.top = '50%';
		defaultStyle['margin-top'] = '-22px';
		defaultStyle['z-index'] = "9";
		defaultStyle.width = '43px';
		defaultStyle.position = 'absolute';
		// moreGamesButtonSprite from ga_for_game.tmpl
		defaultStyle['background-image'] = 'url(' + moreGamesButtonSprite + ')';

		for (var key in style){
			if (!customStyle){
				customStyle = {};
			}
			customStyle[key] = style[key];
			defaultStyle[key] = style[key];
		}

		for (var key in defaultStyle){
			moreGamesLink.style[key] = defaultStyle[key];
		}

		moreGamesLink.style.display = 'block';
	}

	this.hideMoreGamesButton = function(){
		if (moreGamesLink){
			moreGamesLink.style.display = 'none';
		}
	}

	/**
	* Get player avatar
	* @function getAvatar
	* @memberof Gfsdk
	*/
	this.getAvatar = function(){
		var avatar;
		if(!!config.user && !!config.user.avatar){
			avatar = config.user.avatar;
		} else {
			avatar = null;
		}

		Utils.log("GamifiveSDK", "getAvatar", avatar);

		return avatar;
	}

	/**
	* Get player nickname
	* @function getNickname
	* @memberof Gfsdk
	*/
	this.getNickname = function(){
		var nickname;
		if(!!config.user && !!config.user.nickname){
			nickname = config.user.nickname;
		} else {
			nickname = null;
		}

		Utils.log("GamifiveSDK", "getNickname", nickname);

		return nickname;
	}



	/********************************************
	*****      EXTERNAL METHODS FOR US      *****
	********************************************/

	/**
	* Control if user is fb connected
	* @function controlFbConnected
	* @memberof Gfsdk
	*/
	this.controlFbConnected = function(){
		Utils.log("GamifiveSDK", "controlFbConnected", !!window.localStorage.getItem("_gameoverOpenFbModal_"), !config.user.fbConnected);

		if(!!window.localStorage.getItem("_gameoverOpenFbModal_") && !config.user.fbConnected){
			throwEvent('fb_connect_show');
		}
	}

	/**
	* Login to facebook
	* @function login
	* @memberof Gfsdk
	* @param {function} callbackSuccess - callback for success case
	* @param {function} callbackError - callback for error case
	*/
	this.login = function(callbackSuccess, callbackError){
		Utils.log("GamifiveSDK", "login", config.user.fbConnected);

		// user is already fb-connected
		if(config.user.fbConnected){
			callbackSuccess();
			return;
		}

		// fbExternal case
		if(config.fbExternal){
			document.location.href = config.fbExternal;
			return;
		}

		// user is not fb-connected
		FBConnector.login(function(loginResp){
			Utils.log("GamifiveSDK", "login", "FBConnector.login", loginResp);

			if(loginResp.status == "connected"){

				// call mipConnect API
				Utils.xhr('GET', API('mipConnect', {
						access_token: loginResp.authResponse.accessToken
					}), function(mipResp, mipReq){
						Utils.log("GamifiveSDK", "login", "mipConnect", mipResp, mipReq);

						if (parseInt(mipReq.status) == 200) {
							// call callback success
							callbackSuccess(mipResp);

							// set fbConnected
							config.user.fbConnected = true;

							// set fbUserId
							if(!!loginResp.authResponse && !!loginResp.authResponse.userID){
								config.user.fbUserId = loginResp.authResponse.userID;
							}
						} else {
							// call callback error
							if(!!callbackError){
								callbackError(mipResp);
							}
						}
					}
				);

			}
		});

	}

	/**
	* Connect to facebook
	* @function connect
	* @memberof Gfsdk
	*/
	this.connect = function(){
		Utils.log("GamifiveSDK", "connect");

		this.login(function(resp){
			// success case
			throwEvent('mip_connect_success', resp);
		}, function(resp){
			// error case
			throwEvent('mip_connect_error', resp);
		});
	}

	/**
	* Invite facebook friends
	* @function invite
	* @memberof Gfsdk
	*/
	this.invite = function() {
		Utils.log("GamifiveSDK", "invite");

		this.login(function(loginResp){

			// success case
			var message = config.dictionary.messageOfFbChallenge;
			var param = {
				score: config.score,
				contentId: config.contentId,
				userId: config.user.userId,
				message: message.replace("%s", config.score)
			};
			// log
			Utils.log("GamifiveSDK", "invite", "login", param);
			// invite fb friends
			FBConnector.invite(param, function(invResp){
				Utils.log("GamifiveSDK", "invite", "FBConnector.invite", invResp);

				if(!!invResp && invResp.to.length > 0 && !config.user.userGuest) {
					// call updateCredits API
					if (!!config.user && config.user.userFreemium){
						Utils.xhr('GET', API('updateCredits', {
								fbusers_id: invResp.to || null,
								userId: config.user.userId || null
							}), function(updResp){
								throwEvent('user_credits_updated', updResp);
						});
					}
					else {
						throwEvent('user_credits_updated', {title: "", message: config.CHALLENGE_MESSAGE, success: true});
					}
				}
			});

		}, function(loginResp){
			// error case
			throwEvent('mip_connect_error', loginResp);
		});
	}

	/**
	* Share on facebook
	* @function share
	* @memberof Gfsdk
	*/
	this.share = function(url, callback){
		Utils.log("GamifiveSDK", "share", url);

		FBConnector.share(url, callback || function(){})
	}

	/**
	* Send on facebook
	* @function send
	* @memberof Gfsdk
	*/
	this.send = function(url, callback){
		Utils.log("GamifiveSDK", "send", url);

		FBConnector.send(url, callback || function(){});
	}

	/**
	* Challenge facebook friends
	* @function challenge
	* @memberof Gfsdk
	* @param {string} challengedId - id of challenged user
	*/
	this.challenge = function(challengedId){
		Utils.log("GamifiveSDK", "challenge", challengedId);

		Utils.xhr('GET', API('newChallenge', {
				content_id: config.contentId,
				challenger_id: config.user.userId,
				challenged_id: challengedId,
				challenger_score: config.score
			}), function(resp){
				throwEvent('challenge_completed', resp);
		});
	}

	/**
	* Bind callback to an event
	* @function onEvent
	* @memberof Gfsdk
	* @param {string} event - name of event
	* @param {function} callback - callback method
	*/
	this.onEvent = function(event, callback){
		Utils.log("GamifiveSDK", "onEvent", event, callback);

		config.events[event] = callback;
	}

	/**
	* Get config
	* @function getConfig
	* @memberof Gfsdk
	*/
	this.getConfig = function(){
		return config;
	}



	/********************************************
	*****          INTERNAL METHODS         *****
	********************************************/

	/**
	* Throw an event
	* @function throwEvent
	* @memberof Gfsdk
	* @param {string} event - name of event
	* @param {object} param - parameters passed to function
	*/
	var throwEvent = function(event, param){
		Utils.log("GamifiveSDK", "throwEvent", event, param);

		if(config.events[event]){
			config.events[event](param);
		}
	}
	this.throwEvent = throwEvent;

	/**
	* Return APIs complete URL
	* @function API
	* @memberof Gfsdk
	* @param {string} name - name of API
	* @param {object} param - parameters used as query string
	*/
	var API = function(name, param){
		// set host
		var host = (!config.debug) ? Utils.getAbsoluteUrl() : 'http://www2.giochissimo.it';

		// set door (/v01/ or /mock/)
		var door = (!config.debug) ? '/v01/' : 'mock01/';

		// set url core
		var urlCore = {
			canDownload: 'user.candownload/' + config.contentId,
			gameover: 'gameover/' + config.contentId,
			updateCredits: 'mipuser.updatecredits',
			newChallenge: 'challenge.post',
			mipConnect: 'mipuser.fbconnect',
			leaderboard: 'leaderboard',
			gamifiveinfo: 'gamifiveinfo',
			gameplay: 'gameplay',

            gameplay_proxy: 'gameplay_proxy'
		};

		// convert param to queryString
		var queryString = Utils.querify(param);

		// return complete URl
		return host + door + urlCore[name] + queryString;
	}

	var sdkElement = {

		/**
		* Create and fill sdk dom element
		* @function sdkElement.create
		* @memberof Gfsdk
		* @param {string} html - html code to fill dom element
		*/
		create: function(html){
			// create gfsdk_root element if not present
			if(!document.getElementById('gfsdk_root')){
				var element = document.createElement('div');
				element.id = "gfsdk_root";
				// add to DOM
				document.body.appendChild(element);
				// stop propagation events
				var stopPropagation = function(e) {e.stopPropagation();}
				element.addEventListener('touchmove', stopPropagation);
				element.addEventListener('touchstart', stopPropagation);
				element.addEventListener('touchend', stopPropagation);
				// fill html of element
				element.innerHTML = html;

				Utils.log("GamifiveSDK", "create", "element", html, element);
			}
		},

		/**
		* Delete sdk dom element
		* @function sdkElement.delete
		* @memberof Gfsdk
		*/
		delete: function(){
			// remove element from DOM if present
			if(!!document.getElementById('gfsdk_root')){
				var element = document.getElementById('gfsdk_root');
				document.body.removeChild(element);

				Utils.log("GamifiveSDK", "delete", element);
			}
		}
	};

};

// GamefiveSDK alias GamifiveSDK
var GamifiveSDK = GamefiveSDK;
