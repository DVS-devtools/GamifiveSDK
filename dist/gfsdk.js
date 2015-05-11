/**
* Facebook Connector Module
* @class FBConnector
* @version 0.4
*/

var FBConnector = new function() {
	var config = {
		appId: ''
	};

	/**
	* Load the SDK asynchronously
	* @function start
	* @memberof FBConnector
	*/
	this.start = function() {
		var d = document, s = 'script', id = 'facebook-jssdk'; 
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}

	/**
	* Make facebook login, calling FB.login
	* @function login
	* @memberof FBConnector
	* @param {function} callback - callback function after FB.login
	*/
	this.login = function(callback) {
		var chosenDisplay = document.body.clientWidth > 600 ? 'popup' : 'touch';
		FB.login(function(response) {
			if (response.authResponse) {
				callback.call(this, response);
			} else {
				callback.call(this, response);
			}
		}, {scope: 'email,user_friends', display: chosenDisplay });
	}

	/**
	* Invite friends, calling FB.ui
	* @function invite
	* @memberof FBConnector
	* @param {object} options - object passed as data param to FB.ui
	* @param {object} [options.message] - text passed as message param to FB.ui
	* @param {function} callback - callback function after FB.ui
	*/
	this.invite = function(options, callback) {
		FB.ui({method: 'apprequests',                                               
        	message: options.message,                                           
        	data: JSON.stringify(options)                                       
        }, callback);
	}

	/**
	* Share a link
	* @function share
	* @memberof FBConnector
	* @param {string} url - url to share
	* @param {function} callback - callback function after FB.ui
	*/
	this.share = function(url, callback) {
		FB.ui({
			method: 'share',
			href: url,
		}, function(response){
			callback(response);
		});
	}

	/**
	* Send a link
	* @function send
	* @memberof FBConnector
	* @param {string} url - url to share
	* @param {function} callback - callback function after FB.ui
	*/
	this.send = function(url, callback) {
		FB.ui({
			method: 'send',
			link: url,
		}, function(response){
			callback(response);
		});
	}

	/**
	* Set configuration of facebook module (appId)
	* @function setConfig
	* @memberof FBConnector
	* @param {string} key
	* @param {string} value
	*/
	this.setConfig = function(key, value) { 
		if(config[key] != undefined) {
			config[key] = value;
		}
	}

	window.fbAsyncInit = function() {
		FB.init({
			appId      : config.appId,
			cookie     : true,  // enable cookies to allow the server to access 
			xfbml      : false,  // parse social plugins on this page
			version    : 'v2.1' // use version 2.1
		});
	};
}; 

/**
* Utils Module
* @class Utils
* @version 0.4
*/

var Utils = new function() {

	/**
	* Get date now (cross-browser compatibility)
	* @function dateNow
	* @memberof Utils
	*/
	this.dateNow = function(){
		if (!Date.now) {
			return new Date().getTime();
		} else {
			return Date.now();
		}
	}

	/**
	* Copy properties from one object to another object
	* @function copyProperties
	* @memberof Utils
	* @param {object} source
	* @param {object} dest
	*/
	this.copyProperties = function(source, dest) {
	    for (var attr in source) {
	        dest[attr] = source[attr];
	    }
	    return dest;
	}

	/**
	* Get query string of an element's "src" attribute
	* @function getScriptParams
	* @memberof Utils
	* @param {object} selector - selector of element (i.e. #gfsdk)
	*/
	this.getScriptParams = function(selector) {
		var stag = document.querySelector(selector);
		var obj = {}, queryString;
		if (stag) {
			queryString = stag.src.replace(/^[^\?]+\??/,'');
			obj = this.dequerify(queryString);
		}
		return obj;
	}

	/**
	* Cookie management
	* @function cookie
	* @memberof Utils
	*/
	this.cookie = {
		get: function (sKey) {
			var regex = new RegExp(
				"(?:(?:^|.*;)\\s*" 
				+ encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") 
				+ "\\s*\\=\\s*([^;]*).*$)|^.*$"
			)
			var documentCookie = document.cookie.replace(regex, "$1")
			return decodeURIComponent(documentCookie) || null;
		},
		set: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
			var sExpires = "";
			if (vEnd) {
				switch (vEnd.constructor) {
					case Number:
						sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd; 
						break;
					case String: 
						sExpires = "; expires=" + vEnd; 
						break;
					case Date: 
						sExpires = "; expires=" + vEnd.toUTCString(); 
						break;
				}
			}
			document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires 
								+ (sDomain ? "; domain=" + sDomain : "") 
								+ (sPath ? "; path=" + sPath : "") 
								+ (bSecure ? "; secure" : "");
			return true;
		},
		remove: function (sKey, sPath, sDomain) {
			if (!sKey || !this.has(sKey)) return false; 
			document.cookie = encodeURIComponent(sKey) 
								+ "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" 
								+ ( sDomain ? "; domain=" + sDomain : "") 
								+ ( sPath ? "; path=" + sPath : "");
			return true;
		},
		has: function (sKey) {
			var regex = "(?:^|;\\s*)" 
						+ encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") 
						+ "\\s*\\=";
			return new RegExp(regex).test(document.cookie);
		}
	};

	/**
	* Get only domain name (window.location.origin)
	* @function getAbsoluteUrl
	* @memberof Utils
	*/
	this.getAbsoluteUrl = function() {
		return window.location.origin;
	}

	/**
	* Make XMLHttpRequest
	* @function xhr
	* @param {string} method - method of request (GET, POST...)
	* @param {string} url - url of request
	* @param {function} callback - callback called when request finished and response is ready 
	* @memberof Utils
	*/
	this.xhr = function(method, url, callback) {
		var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
            	var resp;
            	try { 
            		resp = xhr.response.replace(/(\n|\r)/gm,"");
            		resp = JSON.parse(resp);
            	} catch(e) {}
            	resp.success = (xhr.status >= 200 && xhr.status <= 399);
                if (callback) callback(resp , xhr);
            }
        };
        xhr.open(method, url);
        xhr.send();
        return xhr;
    };

    /**
	* Convert an object to a query string
	* @function querify
	* @param {object} obj - object to be converted
	* @memberof Utils
	*/
	this.querify = function(obj) {
		if (!obj) return '';
		var str = new Array(Object.keys(obj).length),
			index = 0;
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str[index++] = p + "=" + obj[p];
		}
		return '?' + str.join("&");
	}

	/**
	* Convert a query string to an object
	* @function dequerify
	* @param {string} query - string to be converted
	* @memberof Utils
	*/
	this.dequerify = function(query) {
		var params = new Object();
		if (!query) return params; // return empty object

		query = query.replace('?', '');
		var pairs = query.split(/[;&]/);
		
		for (var i=0; i<pairs.length; i++) {
			var keyVal = pairs[i].split('=');
			if (!keyVal || keyVal.length != 2) continue;
			var key = unescape(keyVal[0]);
			var val = unescape(keyVal[1]);
			val = val.replace(/\+/g, ' ');
			params[key] = val;
		}
		return params;
	}

	/**
	* Enable log
	* @function enableLog
	* @memberof Utils
	* @param {boolean} enable
	*/
	var flagLog = false;
	this.enableLog = function(enable) {
		flagLog = !!enable;
	}

	/**
	* Log
	* @function log
	* @memberof Utils
	* @param content
	*/
	this.log = function() {
		if(flagLog){
			var printable = new Array(arguments.length);
			for(var k=0; k < arguments.length; k++){
				printable[k] = arguments[k];
			}
			console.log(printable);
		}
	}

	/**
	* Debug
	* @function error
	* @memberof Utils
	* @param content
	*/
	this.debug = function() {
		var printable = new Array(arguments.length);
		for(var k=0; k < arguments.length; k++){
			printable[k] = arguments[k];
		}
		console.debug(printable);
	}

	/**
	* Error
	* @function error
	* @memberof Utils
	* @param content
	*/
	this.error = function() {
		var printable = new Array(arguments.length);
		for(var k=0; k < arguments.length; k++){
			printable[k] = arguments[k];
		}
		console.error(printable);
	}

	/**
	* Verify if an element has class
	* @function hasClass
	* @memberof Utils
	* @param {string} id - id of element
	* @param {string} className - class name
	*/
  	this.hasClass = function(id, className) {
		return (' ' + document.getElementById(id).className + ' ').indexOf(' ' + className + ' ') > -1;
	}

	/**
	* Show element
	* @function show
	* @memberof Utils
	* @param {string} id - id of element
	*/
	this.show = function(id){
		if(!!document.getElementById(id)){
			if(this.hasClass(id, "hide")){
				document.getElementById(id).className = document.getElementById(id).className.replace(/\bhide\b/,'');
			}
		}
	}

	/**
	* Hide element
	* @function hide
	* @memberof Utils
	* @param {string} id - id of element
	*/
	this.hide = function(id){
		if(!!document.getElementById(id)){
			if(!this.hasClass(id, "hide")){
				document.getElementById(id).className += " hide";
			}
		}
	}
}

/**
* Gameover.js
* @class Gameover
* @version 0.4
*/

var GameOverCore = new function() {

	/********************************************
	***** EXTERNAL METHODS FOR GAMEOVER TMPL ****
	********************************************/
 
	this.playAgain = function(){
		// call to sdk
		GamefiveSDK.startSession();
	} 

	var likeBtnId = "gameOverLikeBtn";
	var heartIconId = "heartIcon";

	var apiKey = "abcdef1234567890";
	var MOA_API_FAVORITES_SET = "http://www2.giochissimo.it/v01/favorites.set";
	var MOA_API_FAVORITES_DELETE = "http://www2.giochissimo.it/v01/favorites.delete";
	var MOA_API_FAVORITES_GET = "http://www2.giochissimo.it/v01/favorites.get";
	var MOA_API_RECOMMEND_EVENT = "http://www2.giochissimo.it/mip-ingestion/v01/recommend/event/:EVENT";

	this.invite = function(){
		// call to sdk
		GamefiveSDK.invite();

		var config = GamefiveSDK.getConfig();
		var properties = {
			valuable_cd: 'No',
			action_cd: 'Yes'
		}
		this.trackEvent("Challenge", "FbInvite", config.game.title + " + " + config.contentId, properties);
	}

	this.share = function(url){
		// call to sdk
		GamefiveSDK.share(url);

		// tracking
		var config = GamefiveSDK.getConfig();
		this.trackEvent("Challenge", "FbScore", config.game.title + " + " + config.contentId, { valuable_cd: 'No', action_cd: 'Yes' });
	}

	this.send = function(url){
		// call to sdk
		GamefiveSDK.send(url);

		// tracking
		var config = GamefiveSDK.getConfig();
		this.trackEvent("Challenge", "FbSend", config.game.title + " + " + config.contentId, { valuable_cd: 'No', action_cd: 'Yes' });
	}

	this.g5challenge = function(userId){
		// call to sdk
		GamefiveSDK.challenge(userId);
	}

	this.otherGames = function(){
		// return true for link
		return true;
	}

	this.connect = function(){
		// call to sdk
		GamefiveSDK.connect();
	}

	this.addListeners = function(){
		var _this = this;

		Utils.log("Gameover", "addListeners");

		GamefiveSDK.onEvent('user_no_credits', function(e) {
			// show paywall
			Utils.show("paywall");
		});

		GamefiveSDK.onEvent('user_credits_updated', function(e) {
			// hide paywall, if present
			Utils.hide("paywall");

			// show message
			_this.showMessage(e.title, e.message, e.success);
			
			// show updated credits feedback
			if(typeof(e.credits) != 'undefined'){
				var newCredits = parseInt(e.credits);
				var newMessage = "";
				var config = GamefiveSDK.getConfig();

				// zero credits
				if(newCredits == 0 && typeof(config.dictionary.matchLeftNone) != 'undefined'){
					newMessage = (config.dictionary.matchLeftNone).replace("%s", newCredits);	
					document.getElementById("credits-count").innerHTML = newMessage;	
				// one credit
				} else if(newCredits == 1 && typeof(config.dictionary.matchLeftSingular) != 'undefined'){
					newMessage = (config.dictionary.matchLeftSingular).replace("%s", newCredits);
					document.getElementById("credits-count").innerHTML = newMessage;
				// more credits
				} else if(newCredits > 1 && typeof(config.dictionary.matchLeftPlural) != 'undefined'){
					newMessage = (config.dictionary.matchLeftPlural).replace("%s", newCredits);
					document.getElementById("credits-count").innerHTML = newMessage;
				}
			}
		});

		GamefiveSDK.onEvent('challenge_completed', function(e) {
			if(e.success){
				// hide challenge button and show challenge feedback
				Utils.hide("challenge-ready-" + e.challenged_user_id);
				Utils.show("challenge-completed-" + e.challenged_user_id);
				// hide challenged name and show challenge feedback
				Utils.hide("name-ready-" + e.challenged_user_id);
				Utils.show("name-completed-" + e.challenged_user_id);
			} else {
				// show message
				_this.showMessage(e.title, e.message, false);
			}
		});

		GamefiveSDK.onEvent('mip_connect_success', function(e) {
			// hide modal, if present
			Utils.hide("fbconnect-calltoaction");
			// show message
			if(!!e && typeof(e.title)!="undefined" && typeof(e.success_message)!="undefined"){
				_this.showMessage(e.title, e.success_message, true);
			}
			// remove key from localstorage
			if(!!window.localStorage.getItem("_gameoverOpenFbModal_")){
				localStorage.removeItem("_gameoverOpenFbModal_");
			}
		});

		GamefiveSDK.onEvent('mip_connect_error', function(e) {
			// hide modal, if present
			Utils.hide("fbconnect-calltoaction");
			// show message
			if(!!e && typeof(e.title)!="undefined" && typeof(e.error_message)!="undefined"){
				_this.showMessage(e.title, e.error_message, false);
			}
		});

		GamefiveSDK.onEvent('fb_connect_show', function(e){
			// show modal, if present
			Utils.show("fbconnect-calltoaction");
		});
	}

	this.trackEvent = function(category, action, label, properties){
		var config = GamefiveSDK.getConfig();
		if(!config.debug){
			GameAnalytics.trackEvent(category, action, label, properties);
		} else {
			Utils.log("GameAnalytics", "trackEvent", category, action, label, properties);
		}
	}

	this.showMessage = function(title, message, success){
		Utils.log("Gameover", "showMessage", title, message, success);

		// fill message
		document.getElementById("message-title").innerHTML = title;
		document.getElementById("message-text").innerHTML = message;
		// show message
		Utils.show("messages");
		// add right class
		if(success) {
			// add success class
			document.getElementById("messages").className += " success";
		} else {
			// add error class
			document.getElementById("messages").className += " error";
		}
	} 

	this.closeMessage = function(){
		Utils.log("Gameover", "closeMessage");

		// hide message
		Utils.hide("messages");
		// remove error and success classes
		document.getElementById("messages").className = document.getElementById("messages").className.replace(/\berror\b/,'');
		document.getElementById("messages").className = document.getElementById("messages").className.replace(/\bsuccess\b/,'');
	}

	var createQuery = function(params){
		var query = []
		for (var key in params){
			query.push(key + '=' + params[key]);
		}
		return '?' + query.join('&')
	}

	this.switchHeart = function(value){
		var btn = document.getElementById(likeBtnId);
		var ico = document.getElementById(heartIconId);

		if (value){
			if (btn.className.indexOf('heart-active') < 0){				
				btn.className += ' heart-active ';
			}
			if (ico.className.indexOf('ico-red') < 0){				
				ico.className += ' ico-red ';
			}
		}
		else {
			btn.className = btn.className.replace('heart-active', '');
			ico.className = ico.className.replace('ico-red', '');
		}
	}

	this.like = function(contentId){
		// Favorites

		var _this = this;

		var favorites_params = {	
			"apikey": apiKey,
			"content_id": contentId
		}

		var favUrl = MOA_API_FAVORITES_SET;
		favUrl += createQuery(favorites_params);

		Utils.xhr('POST', favUrl, function(resp, xhr){
			// heart icon becomes red 
			_this.switchHeart(true);

			// add to likesList
			likesList[contentId] = true;

			// track add to favorites
			_this.trackEvent({ 
				category: 'Favorites', 
				action: 'Add', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});

		});
	}

	this.dislike = function(contentId){

		// Favorites
		var _this = this;

		var favorites_params = {	
			"apikey": apiKey,
			"content_id": contentId
		}

		var favUrl = MOA_API_FAVORITES_DELETE;
		favUrl += createQuery(favorites_params);

		Utils.xhr('POST', favUrl, function(resp, xhr){
			// heart icon switched off
			_this.switchHeart(false);

			// remove from likesList
			delete likesList[contentId];

			// track remove from favorites
			_this.trackEvent({ 
				category: 'Favorites', 
				action: 'Remove', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});
		});
	}

	this.toggleLike = function (){
		var icon = document.getElementById(heartIconId);
		
		var favorites_params = {	
			"apikey": apiKey
		}

		var url = MOA_API_FAVORITES_GET;
		url += createQuery(favorites_params);

		if (!this.getStatus(window.contentId)){
			this.like(window.contentId);
		}
		else {
			this.dislike(window.contentId);
		}
	}

	var likesList = undefined;

	this.getStatus = function(contentId){
		return !!likesList[contentId];
	}

	this.setLikesList = function(callback){
		Utils.xhr('GET', url, function(resp, xhr){
			likesList = {}
			for (var index = 0; index < resp.length; index++){
				var item = resp[index];
				likesList[item.contentId] = true;
			}
			if (callback && typeof callback == 'function'){
				callback();
			}
		});
	};

	this.getLikesList = function(){
		return likesList;
	};

	this.initializeLike = function(){
		var _this = this;

		var doInitialize = function (){
			if (_this.getStatus(window.contentId)){
				_this.switchHeart(true);
			}else {
				_this.switchHeart(false);
			}
		}

		if (likesList === undefined){
			_this.setLikesList(doInitialize);
		}
		else {
			doInitialize();
		}
	}

}
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

		// get window.GamifiveInfo
		if(!config.debug){
			Utils.copyProperties(window.GamifiveInfo, config);
			initPost();
		} else {
			Utils.xhr('GET', API('gamifiveinfo'), function(resp, req){
				Utils.copyProperties(resp, config);
				initPost();
			});
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
		GameOverCore.trackEvent('Play', 'GameStart', config.game.title + " + " + config.contentId, { valuable_cd: 'Yes', action_cd: 'Yes' });
		newtonTrackEvent({ 
			category: 'Play', 
			action: 'GameStart', 
			label: config.game.title + " + " + config.contentId, 
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
		if(typeof(param.score) == 'number'){
			config.score = parseFloat(param.score);
		}

		if(!config.lite){

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
				// render page with resp
				sdkElement.create(resp);
				GameOverCore.initializeLike();
			});

		} else {

			// call gameover API
			Utils.xhr('GET', API('leaderboard', {
				'start': config.timestart,
				'duration': config.timeend - config.timestart,
				'score': config.score,
	      		'newapps': 1,
	      		'appId': config.contentId,
	      		'label': config.label,
	      		'userId': config.userId
			}));

		}

		// ERROR HANDLING
		if (config.timestart && typeof(config.timestart) == 'number'){
			Utils.debug("GamifiveSDK", "OK", "startSession has been called correctly");
		} else {
			Utils.error("GamifiveSDK", "ERROR", "startSession has not been called");
		}

		if (typeof(config.score) == 'number'){
			Utils.debug("GamifiveSDK", "OK", "score has been set correctly");
		} else {
			Utils.error("GamifiveSDK", "ERROR", "missing score value");
		}	

		// TRACKING
		GameOverCore.trackEvent('Play', 'GameEnd', config.game.title + " + " + config.contentId, { valuable_cd: 'No', action_cd: 'No' });	
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

				if(!!invResp && invResp.to.length > 0) {
					// call updateCredits API
					Utils.xhr('GET', API('updateCredits', {
							fbusers_id: invResp.to || null,
							userId: config.user.userId || null
						}), function(updResp){
							throwEvent('user_credits_updated', updResp);
					});
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
	this.share = function(url){
		Utils.log("GamifiveSDK", "share", url);

		FBConnector.share(url, function(resp){
			Utils.log("GamifiveSDK", "share", "success", resp);
		})
	}

	/**
	* Send on facebook
	* @function send
	* @memberof Gfsdk
	*/
	this.send = function(url){
		Utils.log("GamifiveSDK", "send", url);

		FBConnector.send(url, function(resp){
			Utils.log("GamifiveSDK", "send", "success", resp);
		})
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