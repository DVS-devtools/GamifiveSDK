(function(target) {


	if (!Date.now) {
		Date.now = function() { return new Date().getTime() };
	}

	var copyProperties = function(source, dest) {
	    for (var attr in source) {
	        if (source.hasOwnProperty(attr)) dest[attr] = source[attr];
	    }
	    return dest;
	}

	var getScriptParams = function() {
		var stag = document.querySelector('#gfsdk');
		if (!stag) return {};
		var queryString = stag.src.replace(/^[^\?]+\??/,'');
		var obj = dequeryfy(queryString);
		return obj;
	}

	var cookie = {
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

	var getAbsoluteUrl = function() {
		var parts = window.location.href.split('/');
		parts.splice(parts.length-1);
		return parts.join('/');
	}

	var xhr = function() {
	    return function( method, url, callback ) {
			//if(currentConf.debugMode || !currentConf.httpEnabled) return;
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

	function querify(obj) {
		if (!obj) return '';
		var str = [];
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
		return '?'+str.join("&");
	}

	function dequeryfy (query) {
		var Params = new Object ();
		if ( ! query ) return Params; // return empty object
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
				config.onLogged.call(this, response);
			} else {
				config.onLogged.call(this, response);
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
			version: '0.3',
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
			domRoot.style.position = 'absolute';
			domRoot.style.width = '100%';
			domRoot.style.height = '100%';
			domRoot.style.top = '0';
			domRoot.style.left = '0';
			domRoot.style.background = 'white';
			domRoot.style.zIndex = '1000';
			document.body.appendChild(domRoot);
			return domRoot;
		}

		var currentConf = {
			logEnabled: false,
			httpEnabled: true,
			debugMode: false,
			startCallback: null,
			eventCallback: {}
		};

		var API = function(name, paramsObject) {
			var query = querify(paramsObject);
			var callurl = {
				canDownload: currentConf.debugMode ? 'user.candownload' : 'user.candownload/'+sessionData.contentId,
				gameover: currentConf.debugMode ? 'gameover' : 'gameover/'+sessionData.contentId,
				userInfo: currentConf.debugMode ? 'user.lightinfo' : 'user.lightinfo',
				updateCredits: currentConf.debugMode ? 'mipuser.updatecredits' : 'mipuser.updatecredits',
				gamifiveInfo: currentConf.debugMode ? 'GamifiveInfo' : null,
				newChallenge: currentConf.debugMode ? 'challenge.post' : 'challenge.post',
				mipConnect: currentConf.debugMode ? 'mipuser.fbconnect' : 'mipuser.fbconnect'
			}
			return currentConf.debugMode ? getAbsoluteUrl()+'/mock01/'+callurl[name] : '/v01/'+callurl[name]+query;
		}

		var fb_start = window.location.search.toLowerCase().indexOf('fbstart');
		var fb_login = window.location.search.toLowerCase().indexOf('fblogin');
		

		/**
		* Anything you can do at startup time you must define in here
		*/
		var init = function() {
			var gfInfo = window.GamifiveInfo;
			currentConf.debugMode = getScriptParams().debug;
			if (typeof gfInfo == 'undefined' && currentConf.debugMode) {
				xhr('GET', API('gamifiveInfo'), function(resp, req) {
					if (req.response) window.GamifiveInfo = resp;
					//copyProperties(gfInfo, sessionData);
					//console.log('gamifiveInfo by xhr', gfInfo);
					init();
				});	
			}
			else {
				console.warn('No GamifiveInfo found. Set debugMode=TRUE if you are debugging.');
			}

			if (typeof gfInfo == 'object') {
				copyProperties(gfInfo, sessionData);
				FBConnector.setConfig('appId', sessionData.fbAppId);
				if (fb_start || fb_login) FBConnector.start();

				xhr('GET', API('userInfo'), function(resp, req) {
					if (req.response) sessionData.user = resp;
				});
			}
			if (currentConf.logEnabled) console.log('GamefiveSDK->init', sessionData);
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
			if (typeof confObj != 'object') confObj = {};
			copyProperties(confObj, currentConf);
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

			xhr('GET', API('canDownload'), function(resp, req) {
				if (currentConf.logEnabled) console.log('API::canDownload', resp.canDownload, req);
				if (resp.canDownload) {
					call_start_callback();
				}
				else {
					throwEvent('user_no_credits');
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
			if (currentConf.logEnabled) console.log('GamefiveSDK.onStartSession', callback);
			currentConf.startCallback = callback;
		}

		/**
		* Attach an event handler on a defined event name. 
		* @param {string} name - event name or name associated to the event handler
		* @param {function} callback - Function to be executed whenever the event name is thrown
		*/
		this.onEvent = function(name, callback) {
			if (currentConf.logEnabled) console.log('GamefiveSDK.onError', callback);
			currentConf.eventCallback[name] = callback;
		}

		var throwEvent = function(name) {
			if (currentConf.eventCallback[name]) currentConf.eventCallback[name].call();
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
			
			//if (currentConf.httpEnabled) xhr('GET', API().leaderboard+querystring);
			if (currentConf.httpEnabled) xhr('GET', API('gameover', qobj), renderPage);
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
				console.log('FBConnector.invite resp', inviteResp);		
				if (!inviteResp) {
					throwEvent('fb_invite_error');
				}
				else if (!inviteResp.length) {
					throwEvent('fb_invite_empty');
				}
				else {
					var qobj = querify({ 
						'fbusers_id': inviteResp.to || null,
						'userId': sessionData.userId || null
					});
					if (currentConf.httpEnabled) xhr('GET', API('updateCredits', qobj));
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
				FB.login(function(loginResp){
					if (loginResp.status === 'connected') {
						xhr('GET', API('mipConnect', {access_token: loginResp.authResponse.accessToken}), function(e) {
							console.log('mipConnect response',e);
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
					console.log(loginResp);
				});
			}
			// In this case we require to connect the user on FB but we must redirect on an external page
			else if (sessionData.requireFbConnect && sessionData.fbExternal) {
				document.location.href = sessionData.fbExternal;
			}
		}

		// Initialize the library
		init();
	}

 target.GamefiveSDK = new GamefiveSDK(); 
})(window);