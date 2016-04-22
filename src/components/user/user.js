var Logger  = require('../logger/logger');
var Newton  = require('../newton/newton');
var GA      = require('../ga/ga');
var VHost   = require('../vhost/vhost');
var Network = require('../network/network');

/**
* User module
* @class User
* @version 0.9
*/
var User = new function(){

    var userInstance = this;

    var userInfo;

    var userInfoUrl;
    var loadUserDataUrl;
    var saveUserDataUrl;

    /**
    * initializes the User module
    * @function init
    * @memberof User
    */
    this.init = function(params){

        VHost.afterLoad(function(){    
            userInfoUrl     = VHost.get('USER_CHECK_URL');
            loadUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_GET');
            saveUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_SET');
        });
    }

    /**
    * returns the necessary info about the User
    * @function getInfo
    * @memberof User
    */
    this.getInfo = function(){
        return userInfo;
    }

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

            // TODO: check
            userInfo.gameInfo = data;
            
            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }
            
        });
    }

    /**
    * saves some user's data 
    * @function saveData
    * @memberof User
    */
    this.saveData = function(data, callback){
        Logger.info('GamifiveSDK', 'User', 'saveUserData', data);
        doSaveUserData(data, callback);
    }

    /**
    * loads some user's data 
    * @function loadData
    * @memberof User
    */
    this.loadData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'loadUserData');

        var contentId = GameInfo.get('contentId');
        var userId    = userInfo.userId;

        var urlToCall = loadUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', '')
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
        
        Network.xhr('GET', urlToCall, function(resp, req){
            
            // TODO: check
            userInfo = resp.response;

            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }

        });

        return userInfo.gameInfo;
    }

    /**
    * clear some user's data 
    * @function clearData
    * @memberof User
    */
    this.clearData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'clearUserData');
        doSaveUserData(null, callback);
    }

};

module.exports = User;