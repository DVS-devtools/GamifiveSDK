(function(target) {


var FBConnector = (function() {
	var friends = [];
	// This is called with the results from from FB.getLoginStatus().
	
	var config = {
		appId: '',//'497938953670292',//'218613018316690',
		autoLogin: false, 
		autoStart: false,
		onLogged: function() {}
	};

	var statusChangeCallback = function(response) {
		if (response.status === 'connected') {
			testAPI();
			config.onLogged.call(this, response);
		} else if (response.status === 'not_authorized') {
			if (config.autoLogin) FBLogin();
		} else {
			if (config.autoLogin) FBLogin();
		}
	}

	var FBLogin = function(callback) {
		var chosenDisplay = document.body.clientWidth > 600 ? 'popup' : 'touch';
		FB.login(function(response) {
			if (response.authResponse) {
				callback.call(this, response);
			} else {
				callback.call(this, response);
			}
		}, {scope: 'email,user_friends', display: chosenDisplay });
	}

	var checkLoginState = function() {
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
	var FBStart = function() {
		var d = document, s = 'script', id = 'facebook-jssdk'; 
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}
	
	var testAPI = function() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
			console.log(response);
		});
	}

	var setConfig = function(name, value) { 
		if(config[name] != undefined) {
			config[name] = value;
		}
	}	

	return {
		start: FBStart,
		login: FBLogin,
		invite: appRequest,
		getFriends: getAllFriends,
		setConfig: setConfig
	}
})(); 


var Utils = function() {
	this.xhrDisabled = false;

	if (!Date.now) {
		Date.now = function() { return new Date().getTime() };
	}

	this.copyProperties = function(source, dest) {
	    for (var attr in source) {
	        //if (source.hasOwnProperty(attr)) // always true?
	        dest[attr] = source[attr];
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

	this.getAbsoluteUrl = function() {
		var parts = window.location.href.split('/');
		parts.splice(parts.length-1);
		return parts.join('/');
	}

	this.xhr = function(method, url, callback) {
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
            	resp.success = (xhr.status <= 399 || xhr.status >= 200);
                if (callback) callback(resp , xhr);
            }
        };
        xhr.open(method, url);
        xhr.send();
        return xhr;
    };

	this.querify = function(obj) {
		if (!obj) return '';
		var str = new Array(Object.keys(obj).length),
			index = 0;
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str[index++] = p + "=" + obj[p];
		}
		return '?' + str.join("&");
	}

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

	// Singleton pattern
	if (!arguments.callee._instance){
		arguments.callee._instance = this;
	}
	return arguments.callee._instance;
  	
}

console.log("Hi, I'm gfsdk!");

 target.GamefiveSDK = new GamefiveSDK(); 
})(window);