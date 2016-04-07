var Logger = require('.components/');

var User = new function(){

    this.saveUserData = function(data, callback){
        Logger.error('GamifiveSDK', 'User', 'saveUserData', 'not implemented');
    }

    this.loadUserData = function(callback){
        Logger.error('GamifiveSDK', 'User', 'loadUserData', 'not implemented');
    }

    this.clearUserData = function(callback){
        Logger.error('GamifiveSDK', 'User', 'clearUserData', 'not implemented');
    }   
};

module.exports = User;