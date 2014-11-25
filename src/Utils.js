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