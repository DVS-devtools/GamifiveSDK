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
		if (parseInt(localStorage.getItem('hybrid')) !== 1){
			var d = document, s = 'script', id = 'facebook-jssdk';
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = "http://connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}
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
		if (parseInt(localStorage.getItem('hybrid')) === 1){

			Stargate.facebookShare(url, callback, function(error){
				console.error("GamifiveSDK :: fb share error", error);
			});
		} else {
			FB.ui({
				method: 'share',
				href: url,
			}, function(response){
				callback(response);
			});
		}
	}

	/**
	* Send a link
	* @function send
	* @memberof FBConnector
	* @param {string} url - url to share
	* @param {function} callback - callback function after FB.ui
	*/
	this.send = function(url, callback) {
		if (isMobile){
			var targetUrl = [
				'http://www.facebook.com/dialog/send',
	  			'?app_id=' + config.appId,
				'&link=' + url,
				'&redirect_uri=' + Utils.getAbsoluteUrl()
			].join('');
			// fallback for mobile devices
			window.open(targetUrl, '_parent'); //'_blank');
		}
		else {
			FB.ui({
				method: 'send',
				display: 'iframe', // TODO: test if this is useful for solving the send message issue
				link: url,
			}, function(response){
				callback(response);
			});
		}
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
			version    : 'v2.4' // use version 2.1
		});
	};
};
