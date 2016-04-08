var User = new function(){

    var userInstance = this;

    var Logger  = require('../logger/logger');
    var Newton  = require('../newton/debug_newton');
    var GA      = require('../ga/debug_ga');
    var VHost   = require('../vhost/debug_vhost');
    var Network = require('../network/debug_network');

    var userInfo;

    var userInfoUrl     = VHost.get('...');
    var loadUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_GET');
    var saveUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_SET');

    var doSaveUserData = function(data, callback){

        var contentId  = GameInfo.get('...');
        var userId     = '...';
        var userDataId = '...';

        var urlToCall = saveUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', userDataId)
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
            
        Network.xhr('GET', urlToCall, function(resp, req){
            
            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }
            
        });
    }

    this.saveUserData = function(data, callback){
        Logger.info('GamifiveSDK', 'User', 'saveUserData', data);
        doSaveUserData(data, callback);
    }

    this.loadUserData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'loadUserData');

        var contentId = GameInfo.get('...');
        var userId    = '...';

        var urlToCall = loadUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', '')
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
        
        Network.xhr('GET', urlToCall, function(resp, req){
            
            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }

        });

        return userInfo.gameInfo;
    }

    this.clearUserData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'clearUserData');
        doSaveUserData(null, callback);
    }

};

module.exports = User;