/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var config = new Object();



	/********************************************
	*****  EXTERNAL METHODS FOR DEVELOPERS  *****
	********************************************/ 

	/**
	* Init GamefiveSDK
	* @function init
	* @memberof Gfsdk
	* @param {object} param - configuration
	* @param {boolean} [param.debug] - Set debug mode
	* @param {boolean} [param.log] - Enable/disable logging
	* @param {boolean} [param.lite] - If true SDK doesn't implement GameOver status 
	*/
	this.init = function(param){
		// get param
		Utils.copyProperties(param, config);

		// enable/disable logging
		Utils.enableLog(!!config.log);

		// get window.GamifiveInfo
		// DEBUG: call mock api
		Utils.copyProperties(window.GamifiveInfo, config);

		// init events array
		config.events = [];

		// set facebook appId and init facebook
		FBConnector.setConfig('appId', config.fbAppId);
		FBConnector.start();

		Utils.log("GamifiveSDK", "init", config);
	}

	/**
	* Set callback used after startSession
	* @function onStartSession
	* @memberof Gfsdk
	* @param {function} callback
	*/
	this.onStartSession = function(callback) {
		Utils.log("GamifiveSDK", "onStartSession", callback);

		// set callback in config
		config.startCallback = callback;
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

		Utils.xhr('GET', API('canDownload'), function(resp, req){
			Utils.log("GamifiveSDK", "startSession", "canDownload", resp, req);

			if(resp.canDownload){
				// TODO: clear dom
				// sessionData.dom = null;

				// call onStartSession callback
				config.startCallback.call();
			} else {
				// call gameover API
				Utils.xhr('GET', API('gameover'), function (resp, req) {
					// TODO: render page with resp
					// renderPage(resp);

					// throw event 'user_no_credits'
					throwEvent('user_no_credits');
				});
			}
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
		Utils.log("GamifiveSDK", "endSession");

		// set time end
		config.timeend = Utils.dateNow();

		// set score
		if(param.score){
			config.score = parseFloat(param.score);
		} else {
			config.score = 0;
		}

		// get challenge id
		var challengedId;
		if(!!config.challenge && !!config.challenge.id){
			challengedId = config.challenge.id;
		} else {
			challengedId = null;
		}

		// call gameover API
		Utils.xhr('GET', API('gameover', {
			'start': config.timestart,
			'duration': config.timeend - config.timestart,
			'score': config.score,
      		'challenge_id': challengedId
		}), function (resp, req) {
			// TODO: render page with resp
			// renderPage(resp);
		});
		
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

	// TODO: this.challenge

	// TODO: this.login

	// TODO: this.invite

	// TODO: this.connect

	// TODO: this.controlFbConnected

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

	/**
	* Return APIs complete URL
	* @function API
	* @memberof Gfsdk
	* @param {string} name - name of API
	* @param {object} param - parameters used as query string
	*/
	var API = function(name, param){
		// set door (/v01/ or /mock/)
		// DEBUG: call mock api
		var door = '/v01/';

		// set url core
		var urlCore = {
			canDownload: 'user.candownload/' + config.contentId,
			gameover: 'gameover/' + config.contentId,
			paywall: 'gameoverpaywall' + config.contentId,
			userInfo: 'user.lightinfo',
			updateCredits: 'mipuser.updatecredits',
			newChallenge: 'challenge.post',
			mipConnect: 'mipuser.fbconnect'
		};

		// convert param to queryString
		var queryString = Utils.querify(param);

		// return complete URl
		return Utils.getAbsoluteUrl() + door + urlCore[name] + queryString;
	}

	// TODO: clear, set dom

	// TODO: renderPage

	

	

};