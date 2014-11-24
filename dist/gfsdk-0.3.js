(function(target) {


var Utils = function() {
	this.xhrDisabled = false;

	if (!Date.now) {
		Date.now = function() { return new Date().getTime() };
	}

	this.copyProperties = function(source, dest) {
	    for (var attr in source) {
	        if (source.hasOwnProperty(attr)) dest[attr] = source[attr];
	    }
	    return dest;
	}

	this.getScriptParams = function() {
		var stag = document.querySelector('#gfsdk');
		if (!stag) return {};
		var queryString = stag.src.replace(/^[^\?]+\??/,'');
		var obj = this.dequerify(queryString);
		return obj;
	}

	this.cookie = {
		get: function (sKey) {
			return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
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
			document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
			return true;
		},
		remove: function (sKey, sPath, sDomain) {
			if (!sKey || !this.has(sKey)) { return false; }
			document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
			return true;
		},
		has: function (sKey) {
			return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		}
	};

	this.getAbsoluteUrl = function() {
		var parts = window.location.href.split('/');
		parts.splice(parts.length-1);
		return parts.join('/');
	}

	this.xhr = function() {
	    return function( method, url, callback ) {
			if (this.xhrDisabled) return true;
	    	var xhr = new XMLHttpRequest();
	        xhr.onreadystatechange = function() {
	            if ( xhr.readyState === 4 ) {
	            	var resp;
	            	try { 
	            		resp = xhr.response.replace(/(\r\n|\n|\r)/gm,"");
	            		resp = JSON.parse(resp);
	            	}
	            	catch(e) {
	            		//console.warn('xhr failed to json.parse', url, xhr);
	            	}
	                if (callback) callback(resp , xhr );
	            }
	        };
	        xhr.open( method, url );
	        xhr.send();
	        return xhr;
	    };
	}();

	this.querify = function(obj) {
		if (!obj) return '';
		var str = [];
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str.push(p + "=" + obj[p]);
		}
		return '?'+str.join("&");
	}

	this.dequerify = function(query) {
		var Params = new Object ();
		if ( ! query ) return Params; // return empty object
		query = query.replace('?', '');
		var Pairs = query.split(/[;&]/);
		for ( var i = 0; i < Pairs.length; i++ ) {
			var KeyVal = Pairs[i].split('=');
			if ( ! KeyVal || KeyVal.length != 2 ) continue;
			var key = unescape( KeyVal[0] );
			var val = unescape( KeyVal[1] );
			val = val.replace(/\+/g, ' ');
			Params[key] = val;
		}
		return Params;
	}

	if (! arguments.callee._instance ) arguments.callee._instance = this;
	return arguments.callee._instance;
  	//if (!instance) instance = new Utils();
	
}

var FBConnector = (function() {
	var friends = [];
	// This is called with the results from from FB.getLoginStatus().
	var config = {
		appId: '',//'497938953670292',//'218613018316690',
		autoLogin: false, 
		autoStart: false,
		onLogged: function() {}
	};
	function statusChangeCallback(response) {
		if (response.status === 'connected') {
			testAPI();
			config.onLogged.call(this, response);
		} else if (response.status === 'not_authorized') {
			console.log('Please log into this app.');
			if (config.autoLogin) FBLogin();
		} else {
			console.log('Please auth this app.');
			if (config.autoLogin) FBLogin();
		}
	}

	function FBLogin(callback) {
		var chosenDisplay = document.body.clientWidth > 600 ? 'popup' : 'touch';
		FB.login(function(response) {
			if (response.authResponse) {
				console.log('Welcome!  Fetching your information.... ');
				callback.call(this, response);
			} else {
				callback.call(this, response);
				console.log('User cancelled login or did not fully authorize.');
			}
		}, {scope: 'user_friends', display: chosenDisplay });
	}

	function checkLoginState() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	var getAllFriends = function (callback) {
		if (friends.length > 0) return friends;
		var n = 0;
		var copyFriends = function (resp) {
			if (resp && !resp.error) {
				n++;
				friends = friends.concat(resp.data);
				if (n>1) callback(friends); 
			}
			else FBLogin(FB.inviteFriends);
		}
		FB.api( "/me/invitable_friends", copyFriends);
		FB.api( "/me/friends", copyFriends);
	}



	window.fbAsyncInit = function() {
		FB.init({
			appId      : config.appId,
			cookie     : true,  // enable cookies to allow the server to access 
			xfbml      : false,  // parse social plugins on this page
			version    : 'v2.1' // use version 2.1
		});

		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});

	};

	var appRequest = function(options, callback) {
		FB.ui({method: 'apprequests',
			message: 'My score is '+options.score+', try to beat me! Play gratis on Gamefive.',
			data: JSON.stringify(options)
		}, callback);
	}

	// Load the SDK asynchronously
	function FBStart() {
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}
	
	function testAPI() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
			console.log(response);
		});
	}

	return {
		start: FBStart,
		login: FBLogin,
		invite: appRequest,
		getFriends: getAllFriends,
		setConfig: function(name, value) { if(config[name] != undefined) config[name] = value }		
	}

})(); 

	/**
	* GamefiveSDK 0.3 JSDOC Reference
	* @class
	* The GamefiveSDK for JavaScript consists of a single JS file to be included in a SCRIPT element in the HEAD tag of your game HTML. 
	* Please see the TUTORIAL section below for resources.   
	*
	* @tutorial [Version 0.1 Minified Source CDN]{@link  http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.1.min.js}
	* @tutorial [Version 0.3 Minified Source CDN]{@link  http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.3.min.js}
	* @tutorial [Version 0.3 Repository for Game Developers]{@link  https://github.com/Bolza/GamifiveSDK/}
	* @tutorial [Version 0.3 JSDOC Reference]{@link http://s.motime.com/js/wl/webstore_html5game/gfsdk/manual/GamefiveSDK.html}
	* @version 0.3
	* @author Stefano Sergio
	*/
	
		
	function GamefiveSDK() {
		var sessionData = {
			version: '0.3.1',
			contentId: ''
		};
		var _dom;
		Object.defineProperty(sessionData, "dom", {
			get: function () { 
				if (!_dom) _dom = document.querySelector('#gfsdk_root') || createRoot();
				return _dom;
			}, 
			set: function (value) {
				if (!value && _dom) {
					document.body.removeChild(_dom);
					_dom = null;
				}
				else if (value) { 
					sessionData.dom.innerHTML = value; // NB: sessionData.dom implicitly calls the getter before assigning value
				}
				return _dom;
			}
		});

		var createRoot = function() {
			var domRoot = document.createElement('div');
			domRoot.id = "gfsdk_root";
			document.body.appendChild(domRoot);
			var stopPropagation = function(e) {e.stopPropagation();}
			domRoot.addEventListener('touchmove', stopPropagation);
			domRoot.addEventListener('touchstart', stopPropagation);
			domRoot.addEventListener('touchend', stopPropagation);
			var src = "http://s2.motime.com/js/wl/webstore_html5game/gameover.js";
			var script = document.createElement('script');
			script.src = src;
			if (!currentConf.debugMode) domRoot.appendChild(script);
			return domRoot;
		}

		var API = function(name, paramsObject) {
			var query = Utils().querify(paramsObject);
			var callurl = {
				canDownload: currentConf.debugMode ? 'user.candownload' : 'user.candownload/'+sessionData.contentId,
				gameover: currentConf.debugMode ? 'gameover' : 'gameover/'+sessionData.contentId,
				paywall: currentConf.debugMode ? 'gameoverpaywall' : 'gameoverpaywall'+sessionData.contentId,
				userInfo: currentConf.debugMode ? 'user.lightinfo' : 'user.lightinfo',
				updateCredits: currentConf.debugMode ? 'mipuser.updatecredits' : 'mipuser.updatecredits',
				gamifiveInfo: currentConf.debugMode ? 'GamifiveInfo' : null,
				newChallenge: currentConf.debugMode ? 'challenge.post' : 'challenge.post',
				mipConnect: currentConf.debugMode ? 'mipuser.fbconnect' : 'mipuser.fbconnect'
			}
			return currentConf.debugMode ? Utils().getAbsoluteUrl()+'/mock01/'+callurl[name] : '/v01/'+callurl[name]+query;
		}

		/**
		* Anything you can do at startup time you must define in here
		*/
		var init = function() {
			var gfInfo = window.GamifiveInfo;
			currentConf.debugMode = Utils().getScriptParams().debug;
			if (typeof gfInfo == 'undefined' && currentConf.debugMode) {
				Utils().xhr('GET', API('gamifiveInfo'), function(resp, req) {
					if (req.response) window.GamifiveInfo = resp;
					init();
				});	
			}
			else if (typeof gfInfo == 'undefined' && !currentConf.debugMode) {
				console.warn('No GamifiveInfo found. Set add ?debug=true if you are debugging.');
			}

			if (typeof gfInfo == 'object') {
				Utils().copyProperties(gfInfo, sessionData);
				FBConnector.setConfig('appId', sessionData.fbAppId);
				FBConnector.start();

				Utils().xhr('GET', API('userInfo'), function(resp, req) {
					if (req.response) sessionData.user = resp;
				});
				if (currentConf.logEnabled) console.log('GamefiveSDK->init', sessionData);
			}
		}

		/**
		* Updates the config if needed by the user
		* @param {object} confObject - Configuration Object
		* @param {boolean} [confObject.logEnabled=false] - Logging state, only for debug
		* @param {boolean} [confObject.httpEnabled=true] - Enable/Disable xhr calls, should always be TRUE
		* @param {boolean} [confObject.debugMode=false] - Set to TRUE if you want to enable debug mode, only for development environment,
		* the Debug Mode will avoid any external call.
		* @param {function} [confObject.startCallback] - default callback on startSession 
		*/
		this.updateConfig = function(confObj) {
			if (!confObj || typeof confObj != 'object') confObj = {
				logEnabled: false,
				httpEnabled: true,
				debugMode: false,
				startCallback: null,
				eventCallback: {}
			};
			Utils().copyProperties(confObj, currentConf);
			Utils().xhrDisabled = !currentConf.httpEnabled;
			if (currentConf.logEnabled) console.log('GamefiveSDK', 'updateConfig', currentConf);
			return currentConf;
		}

		/**
		* Defines the start of a session. A session is a continued user activity like a game match and the start of a session usually corresponds
		* <br>
		* Ideally a session starts when the player starts playing from the beginning and his score is set to zero. <br>
		* You <b>must</b> always call startSession instead of directly call any "play" method. <br>
		* See [onStartSession]{@link GamefiveSDK#onStartSession} to understand how to start a game match using startSession().
		* @tutorial [onStartSession]{@link GamefiveSDK#onStartSession}
		*/
		this.startSession = function() {
			if (currentConf.logEnabled) console.log('GamefiveSDK.startSession', arguments);
			sessionData.timestart = Date.now();

			function call_start_callback() {
				if (currentConf.logEnabled) console.log('startSession callback now');
				sessionData.dom = null;
				if (currentConf.startCallback) currentConf.startCallback.call();
				else throw new Error('No startSession callback found. use GamefiveSDK.onStartSession(callback) to define one before calling the startSession() method');
			}

			if (currentConf.debugMode && !currentConf.httpEnabled) call_start_callback();
			
			Utils().xhr('GET', API('canDownload'), function(resp, req) {
				if (currentConf.logEnabled) console.log('API::canDownload', resp.canDownload, req);
				if (resp.canDownload) {
					call_start_callback();
				}
				else {
					Utils().xhr('GET', API('gameover'), function(resp, req) {
						renderPage(resp);
						throwEvent('user_no_credits');
					});
				}
			});
		}

		/**
		* Attach a callback to be called at the end of the [startSession]{@link GamefiveSDK#startSession} method.<br>
		* You should have a public "play" function for starting the game and that's the main task for which
		* this event callback will be used.
		* @param {function} callback - Function to be executed whenever startSession is called
		* @example 
		* function playGame() {
		*	//your custom play method 
		* }
		*
		* // here we define the callback for startSession, 
		* // it will start the game match and log into console
		* GamefiveSDK.onStartSession(function() {  
		* 	playGame();
		*  	console.log('Game Started!')
		* })
		*
		* // your custom "play" or "replay" action button
		* var playButton = document.querySelector('#myPlayButton');	
		*
		* // click handler
		* playButton.addEventListener('click', function() {
		*	// just call SDK method which will also execute your play function
		* 	GamefiveSDK.startSession();								
		* });
		* 
		*
		*/
		this.onStartSession = function(callback) {
			if (currentConf.logEnabled) console.log('GamefiveSDK.onStartSession', currentConf);
			currentConf.startCallback = callback;
		}

		/**
		* Attach an event handler on a defined event name. 
		* @param {string} name - event name or name associated to the event handler
		* @param {function} callback - Function to be executed whenever the event name is thrown
		*/
		this.onEvent = function(event, callback) {
			if (currentConf.logEnabled) console.log('GamefiveSDK.onEvent', event);
			if (event instanceof Array) {
				for(var k=0; k < event.length; k++){
					currentConf.eventCallback[event[k]] = callback;
				}
			} else {
				currentConf.eventCallback[event] = callback;
			}
		}

		var throwEvent = function(name, paramsObject) {
			if (currentConf.eventCallback[name]) currentConf.eventCallback[name].call(this, paramsObject);
		}

		/**
		* Defines the end of a session. A session is a continued user activity like a game match. <br>
		* It should end with the score of that session. 
		* Ideally a session ends when the player cannot continue his match and must play again from the beginning. <br>
		* Usually endSession corresponds to the 'Game Over' state. <br>
		* <i> [startSession]{@link GamefiveSDK#startSession} must be called first.</i>
		* @param {object} endingParams - Some parameters can be sent inside an object to enrich the user statistics.
		* @param {float} endingParams.score - User score for the ended session.
		*/	
		this.endSession = function(endingParams) {
			if (currentConf.logEnabled) console.log('GamefiveSDK.endSession', endingParams);
			sessionData.timeend = Date.now();
			sessionData.score = parseFloat(endingParams.score) || 0;
			var qobj = { 
				//'label': sessionData.label,
				//'userId': sessionData.userId,
				'start': sessionData.timestart,
				'duration': sessionData.timeend - sessionData.timestart,
				'score': sessionData.score
          		//challenge_id | id sfida
			};
			
			Utils().xhr('GET', API('gameover', qobj), renderPage);
		}

		var renderPage = function(html) {
			if (currentConf.logEnabled) console.log('render', { 'da': html } );
			sessionData.dom = html; 
		}

		/**
		* Get SDK Status and Data 
		* @returns {Object} Object containing session and user Information
		*/
		this.status = function() {
			return sessionData;
		}
 
		var fbAppRequest = function() {			
			var opt = { 
				score: sessionData.score,
				contentId: sessionData.contentId,
				userId: sessionData.userId 
			}
			FBConnector.invite(opt, function(inviteResp) {
				//console.log('FBConnector.invite resp', inviteResp);
				if (!inviteResp) {
					throwEvent('fb_invite_error', inviteResp);
				}
				else if (!inviteResp.to.length) {
					throwEvent('fb_invite_empty', inviteResp);
				}
				else {
					//newChallenge ?
					throwEvent('fb_invite_success', inviteResp);
					var qobj = { 
						'fbusers_id': inviteResp.to || null,
						'userId': sessionData.userId || null
					};
					Utils().xhr('GET', API('updateCredits', qobj), function(e) {
						throwEvent('user_credits_updated', e);
					});
				}
			});
		}

		this.invite = function() {
			// User is already fb-connected. Skip to appRequest
			if (!sessionData.requireFbConnect && sessionData.fbConnected) {
				fbAppRequest();
			}
			// In this case we require to connect the user on FB and we can do it via JS API
			else if (sessionData.requireFbConnect && !sessionData.fbExternal) {
				FBConnector.login(function(loginResp){
					if (loginResp.status === 'connected') {
						Utils().xhr('GET', API('mipConnect', {access_token: loginResp.authResponse.accessToken}), function(e) {
							//console.log('mipConnect response',e);
							if (parseInt(e.status) == 200) fbAppRequest();
							else throwEvent('user_fbconnect_fail');
						});
					} 
					else if (loginResp.status === 'not_authorized') {
						throwEvent('fb_login_noauth');
					} 
					else {
						throwEvent('fb_login_fail');
					} 
					//console.log(loginResp);
				});
			}
			// In this case we require to connect the user on FB but we must redirect on an external page
			else if (sessionData.requireFbConnect && sessionData.fbExternal) {
				document.location.href = sessionData.fbExternal;
			}
		}

		// Update config
		var currentConf = {};
		this.updateConfig();
		//this.throwEvent = throwEvent;

		// Initialize the library
		init();
	}

 target.GamefiveSDK = new GamefiveSDK(); 
})(window);