	/**
	* Main SDK Class
	* @class
	* Minified Source CDN: {@link  http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.3.min.js}
	* @tutorial {@link http://s.motime.com/js/wl/webstore_html5game/gfsdk/manual/GamefiveSDK.html}
	* @author Stefano Sergio
	*/
	function GamefiveSDK() {
		var sessionData = {};	
		var currentConf = {
			logEnabled: false,
			httpEnabled: true,
			debugMode: true,
			startCallback: null
		};

		var API = {
			canDownload: '/v01/user.candownload/',
			leaderboard: '/v01/leaderboard/',
			userInfo: '/v01/user.lightinfo/'
		}

		var fb_start = window.location.search.toLowerCase().indexOf('fbstart');
		var fb_login = window.location.search.toLowerCase().indexOf('fblogin');
		var GamefiveInfo = window.GamefiveInfo || null;
		
		/**
		* Anything you can do at startup time you must define in here
		*/
		var init = function() {
			if (!GamefiveInfo && currentConf.debugMode) GamefiveInfo = {};
			sessionData.userId = GamefiveInfo.userid;9
			sessionData.label = GamefiveInfo.logEnabled;
			sessionData.appId = GamefiveInfo.contentId || window.location.pathname.split('/')[4] || null;
			sessionData.fbAppId = GamefiveInfo.fbAppId;
			var FBConnector = new Facebook();

			if (fb_start || fb_login) FBConnector.start();

			xhr('GET', API.userInfo, function(resp, req) {
				if (req.response) sessionData.user = resp;
			});
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
			currentConf.logEnabled = confObj.logEnabled || currentConf.logEnabled;
			currentConf.httpEnabled = confObj.httpEnabled || currentConf.httpEnabled;
			currentConf.debugMode = confObj.debugMode || currentConf.debugMode;
			currentConf.startCallback = confObj.startCallback || currentConf.startCallback;
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
				if (currentConf.startCallback) currentConf.startCallback.call();
				else throw new Error('No startSession callback found. use GamefiveSDK.onStartSession(callback) to define one before calling the startSession() method');
			}

			xhr('GET', API.canDownload+sessionData.userId, function(resp, req) {
				console.log('XHR what happened', resp, req);
				if (!req.response && !req.status && currentConf.debugMode) resp = { canDownload:true };
				
				if (resp.canDownload) {
					console.log(' call_start_callback ');
					call_start_callback();
				}
				else {
					console.log(' GameOver special ');
					//get GameOver special
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
			currentConf.startCallback = callback;
		}
		
		/**
		* Defines the end of a session. A session is a continued user activity like a game match. <br>
		* It should end with the score of that session. 
		* Ideally a session ends when the player cannot continue his match and must play again from the beginning. <br>
		* Usually endSession corresponds to the 'Game Over' state. <br>
		* <i> [startSession]{@link GamefiveSDK#startSession} must be called first.</i>
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
			
			if (currentConf.httpEnabled) xhr('GET', API.leaderboard+querystring);
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