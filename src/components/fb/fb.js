var Logger = require('../logger/logger');
var Newton = require('../newton/newton');
var GA     = require('../ga/ga');
var VHost  = require('../vhost/vhost');

var Facebook = new function(){

    this.initialized=false;
    this.isMobile=false;  // retrieve from stargate module

    this.init = function(params){
        var _this=this;
        Logger.log('GamifiveSDK', 'Facebook', 'init', params);

        if (parseInt(localStorage.getItem('hybrid')) !== 1){
          var d = document, s = 'script', id = 'facebook-jssdk';
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "http://connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }

        window.fbAsyncInit = function() {
          FB.init({
            appId      : VHost.get('appId'),
            cookie     : true,    // enable cookies to allow the server to access
            xfbml      : false,   // parse social plugins on this page
            version    : 'v2.4'   // use version 2.1
          });

          _this.initialized=true;

        };
    }

    this.share = function(url, callback){

        if(!this.initialized){
          Logger.error('GamifiveSDK', 'Facebook', 'not yet initialized');
          return false;
        }

        Logger.info('GamifiveSDK', 'Facebook', 'share', url);

        //if (parseInt(localStorage.getItem('hybrid')) === 1){
          // stargate module
    			// Stargate.facebookShare(url, callback, function(error){
    			// 	console.error("GamifiveSDK :: fb share error", error);
    			// });
    		//} else {
    			FB.ui({
    				method: 'share',
    				href: url,
    			}, function(response){
            if (typeof callback === 'function'){
    				    callback(response);
            }
    			});
    		//}

    }

    this.send = function(url, callback){

        if(!this.initialized){
          Logger.error('GamifiveSDK', 'Facebook', 'not yet initialized');
          return false;
        }

        Logger.info('GamifiveSDK', 'Facebook', 'send', url);

        if (this.isMobile){
    			var targetUrl = [
    				'http://www.facebook.com/dialog/send',
    	  			'?app_id=' + VHost.get('appId'),
    				'&link=' + url,
    				'&redirect_uri=' + window.location.origin
    			].join('');
    			window.open(targetUrl, '_parent'); //'_blank');
    		}
    		else {
    			FB.ui({
    				method: 'send',
    				display: 'iframe',
    				link: url,
    			}, function(response){
            if (typeof callback === 'function'){
    				    callback(response);
            }
    			});
    		}
    }
};

module.exports = Facebook;
