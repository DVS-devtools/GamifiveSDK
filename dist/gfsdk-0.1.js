(function(target) {

	// This is called with the results from from FB.getLoginStatus().
	function statusChangeCallback(response) {
		if (response.status === 'connected') {
			testAPI();
		} else if (response.status === 'not_authorized') {
			console.log('Please log into this app.');
			
		} else {
			FB.login(function(response) {
				if (response.authResponse) {
					console.log('Welcome!  Fetching your information.... ');
				} else {
					console.log('User cancelled login or did not fully authorize.');
				}
			}, {scope: 'user_friends'});
		}
	}

	function checkLoginState() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '218613018316690',
			cookie     : true,  // enable cookies to allow the server to access 
			xfbml      : false,  // parse social plugins on this page
			version    : 'v2.1' // use version 2.1
		});

		FB.inviteFriends = function() {
			FB.api(
				"/me/invitable_friends",
				function (response) {
					if (response && !response.error) {
						console.log('invitable_friends',response)
						renderFriendSelector(response);
					}
				}
			);
		}

		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});

		function renderFriendSelector(response) {
			var container = document.body;
			var mfsForm = document.createElement('form');
			mfsForm.id = 'mfsForm';
			// Iterate through the array of friends object and create a checkbox for each one.
			for(var i = 0; i < Math.min(response.data.length, 10); i++) {
				var friendItem = document.createElement('div');
				friendItem.id = 'friend_' + response.data[i].id;
				friendItem.innerHTML = '<input type="checkbox" name="friends" value="'
				+ response.data[i].id
				+ '" />' + response.data[i].name;
				mfsForm.appendChild(friendItem);
			}
			container.appendChild(mfsForm);
			// Create a button to send the Request(s)
			var sendButton = document.createElement('input');
			sendButton.type = 'button';
			sendButton.value = 'Send Request';
			sendButton.onclick = sendRequest;
			mfsForm.appendChild(sendButton);
		}


		function sendRequest() {
			// Get the list of selected friends
			var sendUIDs = '';
			var mfsForm = document.getElementById('mfsForm');
			for(var i = 0; i < mfsForm.friends.length; i++) {
				if(mfsForm.friends[i].checked) {
					sendUIDs += mfsForm.friends[i].value + ',';
				}
			}

			// Use FB.ui to send the Request(s)
			FB.ui({method: 'apprequests',
				to: sendUIDs,
				title: 'My Great Invite',
				message: 'Check out this Awesome App!',
			}, function(res) {
				console.log(res);
			});
		}


	};

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
	window.FBStart = FBStart;

	function testAPI() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
			console.log(response);
		});
	}
	/**
	* Main SDK Class 1.1
	* @class
	* Minified Source CDN: {@link  http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.1.min.js}
	* @tutorial {@link http://s.motime.com/js/wl/webstore_html5game/gfsdk/manual/GamefiveSDK.html}
	* @author Stefano Sergio
	* @param {boolean} [autoInit=false] - if TRUE the constructor calls init function at startup
	*/
	function GamefiveSDK() {
		var mipId, appId, userId, label;
		var sessionData = {
			version: '0.1.1'
		};		
		var currentConf = {
			logEnabled: false,
			httpEnabled: true
		};

		if (!Date.now) {
	    	Date.now = function() { return new Date().getTime() };
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

		var xhr = function() {
		    return function( method, url, callback ) {
		    	var xhr = new XMLHttpRequest();
		        xhr.onreadystatechange = function() {
		            if ( xhr.readyState === 4 ) {
		                if (callback) callback( xhr.responseText );
		            }
		        };
		        xhr.open( method, url );
		        xhr.send();
		        return xhr;
		    };
		}();

		function querify(obj) {
			var str = [];
			for(var p in obj) {
				if (obj.hasOwnProperty(p)) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
			return '?'+str.join("&");
		}


		var init = function() {
			sessionData.userId = GamifiveInfo.userId;
			sessionData.label = GamifiveInfo.label;
			sessionData.appId = GamifiveInfo.contentId;
			if (currentConf.logEnabled) console.log('GamefiveSDK->init', sessionData);
		}

		/**
		* Updates the config if needed by the user
		* @param {object} confObject - Configuration object
		* @param {boolean} [confObject.logEnabled=false] - Logging state, only for debug
		* @param {boolean} [confObject.httpEnabled=true] - Enable/Disable xhr calls, should always be TRUE
		*/
		this.updateConfig = function(confObj) {
			if (typeof confObj != 'object') confObj = {};
			currentConf.logEnabled = confObj.logEnabled || currentConf.logEnabled;
			currentConf.httpEnabled = confObj.httpEnabled || currentConf.httpEnabled;
		}

		/**
		* Defines the start of a session. A session is a continued user activity like a game match. <br>
		* Ideally a session starts when the player starts playing the game from the beginning and his score is set to zero. <br>
		* For example: when the players has lost all his "lifes" and clicks on "Play Again" button. <br>	
		*/
		this.startSession = function() {
			if (currentConf.logEnabled) console.log('GamefiveSDK.startSession', arguments);
			sessionData.timestart = Date.now();
		}
		
		/**
		* Defines the end of a session. A session is a continued user activity like a game match. <br>
		* It should end with the score of that session. 
		* Ideally a session ends when the player cannot continue his match and must play again from the beginning. <br>
		* For example: if the player has x "lifes" then the session only ends when all the x "lifes" are lost. <br>
		* <i>.startSession must be called first.</i>
		* @param {object} endingParams - Some parameters can be sent inside an object to enrich the user statistics.
		* @param {object} endingParams.score - User score for the ended session.
		*/	
		this.endSession = function(endingParams) {
			if (currentConf.logEnabled) console.log('GamefiveSDK.endSession', arguments);
			sessionData.timeend = Date.now();
			var querystring = querify({ 
				'newapps': 1,
				'appId': sessionData.appId,
				'label': sessionData.label,
				'userId': sessionData.userId,
				'start': sessionData.timestart,
				'duration': sessionData.timeend - sessionData.timestart,
				'score': parseFloat(endingParams.score) || 0
			});
			
			if (currentConf.httpEnabled) xhr('GET', '/v01/leaderboard'+querystring);
		}

		/**
		* Get SDK Status and Data 
		* @returns {Object} Object containing Session and User Information
		*/
		this.status = function() {
			return sessionData;
		}

		this.fbInvite = function () {
			xhr('GET', 'https://graph.facebook.com/me/friends', function(e){
				console.log(e);
				
			});
		}


		// Initialize the library
		init();
	}


	window.GamefiveSDK = new GamefiveSDK();

})(window);