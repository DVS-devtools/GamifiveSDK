/**
* Facebook Connector Module
* @class FBConnector
* @version 0.4
*/

var FBConnector = (function() {
	var friends = [];
	
	var config = {
		appId: ''
	};

	/**
	* Load the SDK asynchronously
	* @function start
	* @memberof FBConnector
	*/
	var start = function() {
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
	var login = function(callback) {
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
	var invite = function(options, callback) {
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
	var setConfig = function(key, value) { 
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

	return {
		start: start,
		login: login,
		invite: invite,
		setConfig: setConfig
	}
})(); 
