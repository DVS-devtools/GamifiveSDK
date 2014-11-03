var Facebook = (function() {
	var friends = [];
	// This is called with the results from from FB.getLoginStatus().
	var config = {
		appId: '218613018316690',//'',497938953670292
		autoLogin: false, 
		autoStart: false
	}
	;
	function statusChangeCallback(response) {
		if (response.status === 'connected') {
			testAPI();
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
				if (callback) callback.call(this);
			} else {
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

		FB.invite = function(options, callback) {
			FB.ui({method: 'apprequests',
				message: 'My score is '+options.score+', try to beat me! Play gratis on Gamefive.'
			}, callback);
		}


/*
		FB.inviteFriends = function(options) {
			getAllFriends(renderFriendSelector);

			function renderFriendSelector(friendsList) {
				var container = document.body;
				var mfsForm = document.createElement('form');
				mfsForm.id = 'mfsForm';
				// Iterate through the array of friends object and create a checkbox for each one.
				for(var i = 0; i < Math.min(friendsList.length, 10); i++) {
					var friendItem = document.createElement('div');
					friendItem.id = 'friend_' + friendsList[i].id;
					friendItem.innerHTML = '<input type="checkbox" name="friends" value="'
					+ friendsList[i].id
					+ '" />' + friendsList[i].name;
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
					title: 'Play with me on Gamefive',
					message: 'My score is '+options.score+', try to beat me! Play gratis on Gamefive.',
					data: JSON.stringify(options)
				}, function(res) {
					console.log(res);
					// call to updatecredits
				});
			}
		}
*/

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
		getFriends: getAllFriends,
		appId:  config.appId,
		autoLogin: config.autoLogin,
		autoStart: config.autoStart
	}

}); 