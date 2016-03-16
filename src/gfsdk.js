/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var config = new Object();
	var sdkInstance = this;
	var Utils = GamifiveSDKUtils;
	var moreGamesLink;
	// will hold a reference to Dixie storage or debug mode storage
	var _storage;

	// default key for guest (unknown) user's data
	var userStatusKey = 'GamifiveSDKStatus_unknown';

	/********************************************
	*****  EXTERNAL METHODS FOR DEVELOPERS  *****
	********************************************/ 

	    /**
    * Returns the status of the game
    * @function getStatus
    * @memberof Gfsdk
    */
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

    this.loadUserData = function(callback){
        if (!debug){

            if (window.location.origin.indexOf('cdvfile') < 0){
                 getUserData(callback);
            }
           
            try {
                return config.user.gameInfo.info;
            } catch (err){
                return null;
            }
        } else {
            return storage.get(userStatusKey);
        }
    }

    /**
    * Saves an object to record the status of the game
    * @function saveStatus
    * @memberof Gfsdk
    */
    var setUserData = function(dataToSave){

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
                                + "&domain=" + encodeURIComponent(window.location.origin)
                                + "&contentId=" + config.contentId;
        }        

        if (window.location.origin.indexOf('cdvfile') < 0){

            getUserData(function(){
                setUserDataParams();
                Utils.xhr('POST', setUserDataUrl, function(resp, req){});
            });
        } else {
            setUserDataParams();
            // local save in volatile variable
            config.user.gameInfo.info = dataToSave;
            GamifiveSDKOffline.enqueue(GamifiveSDKOffline.XHR_QUEUE, {method: 'POST', url: setUserDataUrl});
        }
    
    }

    this.saveUserData = function(obj, callback){
        if (!debug){
            setUserData(obj, callback);
        } else {
            storage.set(userStatusKey, callback);
        }
    }

    /**
    * Deletes the status of the game
    * @function clearStatus
    * @memberof Gfsdk
    */
    this.clearUserData = function(){
        if (!debug){
            setUserData(null);   
        } else {
            storage.set(userStatusKey, null);
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

        if (window.location.origin.indexOf('cdvfile') > -1){
            
            Utils.xhr('JSONP', API('gameplay_proxy', gpparams) + config.user.ponyUrl, function(resp, req){
                if (callback){ callback(resp); }
            });
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

        try {
            var gameplayDirPrefix = 'games';
            var rx = new RegExp('<PREFIX>/([a-z0-9]+)/'.replace('<PREFIX>', gameplayDirPrefix));
            config.content_id = window.location.pathname.match(rx)[1];
        } catch (err){
            // not hybrid 
        }

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

        if (typeof storage === 'undefined' && typeof Dixie !== 'undefined'){
            window.storage = new Dixie();
            storage.init({type: 'localStorage'});
        }

		// get window.GamifiveInfo
		if(!config.debug){
			// get storage from ga_for_games (Dixie)
            
			_storage = storage;
			
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
                    _copyInfo();
                });
			}

		} else {
            // mock sprite more games button
			moreGamesButtonSprite = 'http://s.motime.com/img/wl/webstore_html5game/images/gameover/sprite.png?v=20151120101238';

			// debug mode: Dixie is not defined, use a mock 
		    _storage = new function(){
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

        if (window.location.origin.indexOf('cdvfile') > -1){
            Stargate.initialize({}).then(function(){
                Utils.log("GamifiveSDK :: Stargate initialized");

                GamifiveSDKOffline.load();



                Stargate.file.readFileAsJSON(Stargate.game.GAMES_DIR + 'user.json').then(function(userResp){
                    if (typeof config.user === 'undefined'){
                        config.user = {};
                    }
                    for (var userKey in userResp){
                        config.user[userKey] = userResp[userKey];
                    }
                });
                return Stargate.file.readFileAsJSON(Stargate.game.GAMES_DIR + "cookie.json");
            }).then(function(result){
                console.log("readFileAsJSON", result);
                var cookieStorage = new Dixie();
                cookieStorage.init({type: 'cookie'});
                for (var key in result){
                    cookieStorage.set(key, result[key], 7);
                }

                stargateCanPlay(function(){
                    doInit(param);
                }, function(){
                    // todo: torna online!
                });
                
            })
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

	/**
	* Call onStartSession callback
	* @function startSession
	* @memberof Gfsdk
	*/
    var stargateCanPlay = function(successCallback, errorCallback){
        Stargate.file.readFileAsJSON(Stargate.game.GAMES_DIR + "user.json").then(function(result){

            if (new Date(result.data_scadenza_abb) >= new Date()){
                successCallback();
            } else {
                errorCallback();
            }
        }).catch(errorCallback);
    }


	this.startSession = function() {
		Utils.log("GamifiveSDK", "startSession");

		sdkInstance.hideMoreGamesButton();

		// set time start
		config.timestart = Utils.dateNow();



		if(!config.lite){

            if (window.location.origin.indexOf('cdvfile') < 0){
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
                stargateCanPlay(function(){
                    sdkElement.delete();

                    // call onStartSession callback
                    if(!!config.startCallback){
                        config.startCallback.call();
                    }
                }, function(){
                    // todo
                });
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
			if (window.location.origin.indexOf('cdvfile') === -1){
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
            if (window.location.origin.indexOf('cdvfile') === -1){
    			Utils.xhr('GET', leaderboardCallUrl);
            } else {
                GamifiveSDKOffline.enqueue({method: 'GET', url: leaderboardCallUrl})
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
	this.goToHome = function(){

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

        if (window.location.origin.indexOf('cdvfile') < 0){
            document.location.href = window.location.origin;
        } else {
            var homeUrl = window.location.origin;
            var connection = Stargate.checkConnection();
            if (connection.type === 'offline'){
                homeUrl = Stargate.game.OFFLINE_INDEX;
            }
            GamifiveSDKOffline.persist(function(){
               document.location.href = homeUrl; 
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
		var door = (!config.debug) ? '/v01/' : '/mock01/';

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