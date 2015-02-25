/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var config = new Object();

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

					// TODO: throw event 'user_no_credits'
					// throwEvent('user_no_credits');
				});
			}
		});
	}

	// this.onEvent

	// throwEvent

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