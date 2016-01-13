/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var config = new Object();
	var sdkInstance = this;
	var Utils = GamifiveSDKUtils;
	var STATUS_KEY = 'GamifiveSDKStatus';

	var storage;
	if (typeof Dixie !== 'undefined'){
		// inside Gamifive: Dixie is defined
		storage = new Dixie();
		storage.init({type: 'localStorage'});
	} else {
		// debug mode: Dixie is not defined
		storage = new function(){
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
	}

	/********************************************
	*****  EXTERNAL METHODS FOR DEVELOPERS  *****
	********************************************/ 

	/**
	* Saves an object to record the status of the game
	* @function saveStatus
	* @memberof Gfsdk
	*/
	this.saveUserData = function(obj){
		storage.set(STATUS_KEY, obj);
	}

	/**
	* Returns the status of the game
	* @function getStatus
	* @memberof Gfsdk
	*/
	this.loadUserData = function(){
		return storage.get(STATUS_KEY);
	}

	/**
	* Deletes the status of the game
	* @function clearStatus
	* @memberof Gfsdk
	*/
	this.clearUserData = function(){
		storage.delete(STATUS_KEY);
	}

	/**
	* Reset GamefiveSDK
	* @function reset
	* @memberof Gfsdk
	*/
	this.reset = function(){
		config = {};
	}

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
	this.init = function(param){
		// get param
		Utils.copyProperties(param, config);

		// enable/disable debug
		if(localStorage.getItem('log') == 1){
			Utils.enableLog(true);
		} else {
			Utils.enableLog(!!config.log);
		}

		var initPost = function(){
			if(!config.lite){
				// init events array
				config.events = [];

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
			
			GameOverCore.trackEvent('Play', 'GameLoad', config.contentId, { game_title: gameTitle, valuable_cd: 'Yes', action_cd: 'Yes' });
			newtonTrackEvent({ 
				category: 'Play', 
				action: 'GameLoad', 
				game_title: gameTitle,
				label: config.contentId, 
				valuable_cd: 'Yes', 
				action_cd: 'Yes' 
			});
		}

		// get window.GamifiveInfo
		if(!config.debug){
			Utils.copyProperties(window.GamifiveInfo, config);
			if (typeof config.user != 'undefined'){
				config.user.userGuest = !config.user.userFreemium && !config.user.userId; 
			}
			initPost();
			trackGameLoad();

			// from ga_for_game
			config.CHALLENGE_MESSAGE = CHALLENGE_MESSAGE;
			config.MESSAGE_ERROR = MESSAGE_ERROR;
			config.MESSAGE_ERROR_TITLE = MESSAGE_ERROR_TITLE;
		} else {
			// mock newtonTrackEvent
			window.newtonTrackEvent = function(){
				Utils.log(arguments);
			};

			config.CHALLENGE_MESSAGE = 'You successfully invited your friends!';
			config.MESSAGE_ERROR = 'Error!';
			config.MESSAGE_ERROR_TITLE = 'Something went wrong';

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
	this.startSession = function() {
		Utils.log("GamifiveSDK", "startSession");

		// set time start
		config.timestart = Utils.dateNow();

		if(!config.lite){

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

		// TRACKING
		GameOverCore.trackEvent('Play', 'GameStart', config.contentId, { game_title: config.game.title, valuable_cd: 'Yes', action_cd: 'Yes' });
		newtonTrackEvent({ 
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
			Utils.xhr('GET', API('gameover', queryParams), function (resp, req) {
				// render page with resp
				sdkElement.create(resp);
				if (!config.debug && !getAdditionalInfo().guest) {
					GameOverCore.initializeLike();
				};
			});

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

			// call gameover API
			Utils.xhr('GET', API('leaderboard', queryParams));

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

		// TRACKING
		GameOverCore.trackEvent('Play', 'GameEnd', config.contentId, { game_title: config.game.title, valuable_cd: 'No', action_cd: 'No' });	
		newtonTrackEvent({ 
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
    	GameOverCore.trackEvent('Behavior', 'MoreGames', config.contentId, 
    		{ 
    			game_title: config.game.title, 
    			valuable_cd: 'No', 
    			action_cd: 'yes' 
    		}
    	);	
    	newtonTrackEvent({ 
			category: 'Behavior',
			action: 'MoreGames',
			game_title: config.game.title,
			label: config.contentId,
			valuable_cd: 'No',
			action_cd: 'Yes'
		});
    	document.location.href = document.location.origin;
    };

	/**
	* Shows the "More Games" icon. 
	* By clicking on this button the user will be redirected to the homepage.
	*/

	this.showMoreGamesButton = function(style){
        var link = document.createElement('a');

        // assign the outgoing click     
        link.addEventListener('touchend', sdkInstance.goToHome, false);
        link.addEventListener("click", sdkInstance.goToHome, false);
        link.setAttribute("id", "gfsdk-more-games");
		
		// default style
		link.style.left = '2px';
		link.style.height = '44px';
		link.style['background-position'] = '-22px -428px';
		link.style.top = '50%';
		link.style['margin-top'] = '-22px';
		link.style['z-index'] = "9";
		link.style.width = '43px';
		link.style.position = 'absolute';
		link.style.display = 'block';

        for (var key in style){
        	link.style[key] = style[key];
        }

        // moreGamesButtonSprite from ga_for_game.tmpl
		link.style['background-image'] = 'url(' + moreGamesButtonSprite + ')';
		
		// Adds the element to the document
        document.body.appendChild(link);
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
			gamifiveinfo: 'gamifiveinfo'
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