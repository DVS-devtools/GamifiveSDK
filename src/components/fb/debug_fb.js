var Logger = require('.components/');

var Facebook = new function(){

    this.init = function(params){
        Logger.warn('GamifiveSDK', 'Facebook', 'init', 'not available in debug mode');
    }

    this.share = function(callback){
        Logger.warn('GamifiveSDK', 'Facebook', 'share', 'not available in debug mode');
    }

    this.send = function(data){
        Logger.warn('GamifiveSDK', 'Facebook', 'send', 'not available in debug mode');
    }
};

module.exports = Facebook;