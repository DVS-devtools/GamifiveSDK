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
			version    : 'v2.1' // use version 2.1
		});
	};
}; 

/**
* Utils Module
* @class Utils
* @version 0.4
*/

var Utils = new function() {

	/**
	* Get date now (cross-browser compatibility)
	* @function dateNow
	* @memberof Utils
	*/
	this.dateNow = function(){
		if (!Date.now) {
			return new Date().getTime();
		} else {
			return Date.now();
		}
	}

	/**
	* Copy properties from one object to another object
	* @function copyProperties
	* @memberof Utils
	* @param {object} source
	* @param {object} dest
	*/
	this.copyProperties = function(source, dest) {
	    for (var attr in source) {
	        dest[attr] = source[attr];
	    }
	    return dest;
	}

	/**
	* Get query string of an element's "src" attribute
	* @function getScriptParams
	* @memberof Utils
	* @param {object} selector - selector of element (i.e. #gfsdk)
	*/
	this.getScriptParams = function(selector) {
		var stag = document.querySelector(selector);
		var obj = {}, queryString;
		if (stag) {
			queryString = stag.src.replace(/^[^\?]+\??/,'');
			obj = this.dequerify(queryString);
		}
		return obj;
	}

	/**
	* Cookie management
	* @function cookie
	* @memberof Utils
	*/
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

	/**
	* Get only domain name (window.location.origin)
	* @function getAbsoluteUrl
	* @memberof Utils
	*/
	this.getAbsoluteUrl = function() {
		return window.location.origin;
	}

	/**
	* Make XMLHttpRequest
	* @function xhr
	* @param {string} method - method of request (GET, POST...)
	* @param {string} url - url of request
	* @param {function} callback - callback called when request finished and response is ready 
	* @memberof Utils
	*/
	this.xhr = function(method, url, callback) {
		var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
            	var resp;
            	try { 
            		resp = xhr.response.replace(/(\n|\r)/gm,"");
            		resp = JSON.parse(resp);
            	} catch(e) {}
            	resp.success = (xhr.status >= 200 && xhr.status <= 399);
                if (callback) callback(resp , xhr);
            }
        };
        xhr.open(method, url);
        xhr.send();
        return xhr;
    };

    /**
	* Convert an object to a query string
	* @function querify
	* @param {object} obj - object to be converted
	* @memberof Utils
	*/
	this.querify = function(obj) {
		if (!obj) return '';
		var str = new Array(Object.keys(obj).length),
			index = 0;
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str[index++] = p + "=" + obj[p];
		}
		return '?' + str.join("&");
	}

	/**
	* Convert a query string to an object
	* @function dequerify
	* @param {string} query - string to be converted
	* @memberof Utils
	*/
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
  	
}

console.log("Hi, I'm gfsdk!");