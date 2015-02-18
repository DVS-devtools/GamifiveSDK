
var Utils = function() {
	this.xhrDisabled = false;

	if (!Date.now) {
		Date.now = function() { return new Date().getTime() };
	}

	this.copyProperties = function(source, dest) {
	    for (var attr in source) {
	        if (source.hasOwnProperty(attr)) dest[attr] = source[attr];
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

	this.getAbsoluteUrl = function() {
		var parts = window.location.href.split('/');
		parts.splice(parts.length-1);
		return parts.join('/');
	}

	this.xhr = function() {
	    return function( method, url, callback ) {
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
	                if (callback) callback(resp , xhr );
	            }
	        };
	        xhr.open( method, url );
	        xhr.send();
	        return xhr;
	    };
	}();

	this.querify = function(obj) {
		if (!obj) return '';
		var str = [];
		for(var p in obj) {
			if (obj.hasOwnProperty(p)) str.push(p + "=" + obj[p]);
		}
		return '?'+str.join("&");
	}

	this.dequerify = function(query) {
		var Params = new Object ();
		if ( ! query ) return Params; // return empty object
		query = query.replace('?', '');
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

	if (! arguments.callee._instance ) arguments.callee._instance = this;
	return arguments.callee._instance;
  	//if (!instance) instance = new Utils();
	
}
