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
  	
}

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