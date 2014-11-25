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
			message: options.message,
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