
var Logger   = require('../logger/logger');
var Newton   = require('../newton/newton');
var GA       = require('../ga/ga');
var Location = require('../location/location');

/**
* Facebook module
* @namespace Facebook
* @version 0.9
*/
var Facebook = new function(){

    var facebookInstance = this;
    var initialized = false;
    var isMobile = false;  // retrieve from stargate module
    var config;

    /**
    * returns true iff the Facebook sdk has been successfully downloaded and initialized
    * @function isInitialized
    * @memberof Facebook
    */
    this.isInitialized = function(){
        return initialized;
    }

    /**
    * resets the Facebook sdk configuration
    * @function reset
    * @memberof Facebook
    */
    this.reset = function(){
        config = {
            fbVersion: "2.4"
        }
    }
    facebookInstance.reset();

    /**
    * downloads and initializes the Facebook sdk 
    * @function init
    * @memberof Facebook
    */
    this.init = function(params){
        Logger.log('GamifiveSDK', 'Facebook', 'init', params);
        for (var key in params){
            config[key] = params[key];
        }


        if (parseInt(localStorage.getItem('hybrid')) !== 1 && !config.noDownload){
            var d = document, s = 'script', id = 'facebook-jssdk';
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "http://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }

        window.fbAsyncInit = function() {
            if (typeof FB === 'undefined') {
                Logger.error('GamifiveSDK', 'Facebook', 'init', 'cannot download fb sdk');
            } else {
                FB.init({
                    appId      : config.fbAppId,
                    cookie     : true,    // enable cookies to allow the server to access
                    xfbml      : false,   // parse social plugins on this page
                    version    : params.fbVersion   
                });
            }

            initialized = true;
        };
        Logger.log('GamifiveSDK', 'Facebook', 'defined fbAsyncInit', window.fbAsyncInit);

    }

    /**
    * used to display a dialog for sharing on Facebook
    * @function share
    * @memberof Facebook
    */
    this.share = function(url, callback){

        if(!initialized){
          Logger.error('GamifiveSDK', 'Facebook', 'not yet initialized');
          return false;
        }

        Logger.info('GamifiveSDK', 'Facebook', 'share', url);

        var shareParams = {
            method: 'share',
            href: url,
        };
        
    	FB.ui(shareParams, function(response){
            if (typeof callback === 'function'){
    		    callback(response);
            }
    	});

    }

    /**
    * used to send a message on Facebook
    * @function send
    * @memberof Facebook
    */
    this.send = function(url, callback){

        if(!initialized){
            Logger.error('GamifiveSDK', 'Facebook', 'not yet initialized');
            return false;
        }

        Logger.info('GamifiveSDK', 'Facebook', 'send', url);

        if (isMobile){
			var targetUrl = [
				'http://www.facebook.com/dialog/send',
	  			'?app_id=' + config.fbAppId,
				'&link=' + url,
				'&redirect_uri=' + Location.getOrigin()
			].join('');
			window.open(targetUrl, '_parent'); 
		}
		else {
            var shareParams = {
                method: 'send',
                display: 'iframe',
                link: url,
            };

			FB.ui(shareParams, function(response){
            
                if (typeof callback === 'function'){
        			callback(response);
                }
			});
		}
    }
};

module.exports = Facebook;
