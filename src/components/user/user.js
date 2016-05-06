var Constants = require('../constants/constants');
var GA        = require('../ga/ga');
var GameInfo  = require('../game_info/game_info');
var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var Newton    = require('../newton/newton');
var VarCheck  = require('../varcheck/varcheck');
var VHost     = require('../vhost/vhost');

/**
* User module
* @namespace User
* @version 0.9
*/
var User = new function(){

    var userInstance = this;

    var userInfo;

    var userInfoUrl;
    var loadUserDataUrl;
    var saveUserDataUrl;

    VHost.afterLoad(function(){
        userInfoUrl     = VHost.get('MOA_API_USER_CHECK');
        loadUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_GET');
        saveUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_SET');
    });

    /**
    * returns a single value of userInfo, given its key
    * @function get
    * @memberof User
    * @param {String} key the name of the value to be returned
    */
    this.get = function(key){
        return userInfo[key];
    }

    /**
    * resets userInfo
    * @function reset
    * @memberof User
    */
    this.reset = function(){
        userInfo = {};
    }
    userInstance.reset();

    this.getUserId = function(){
        return userInfo.user;
    }

    /**
    * fetches the necessary info about the User (usercheck)
    * @function load
    * @memberof User
    */
    this.fetch = function(callback){
        Logger.log('GamifiveSDK', 'User', 'fetch attempt');

        Network.xhr('GET', userInfoUrl, function(resp, req){

            if(!!resp && resp.success){
                var responseData = resp.response;

                if (typeof responseData == typeof ''){
                    responseData = JSON.parse(responseData);
                }

                Logger.log('GamifiveSDK', 'User', 'fetch complete', responseData);

                for (var key in responseData){
                    userInfo[key] = responseData[key];
                }
            } else {
                Logger.warn(Constants.ERROR_USER_FETCH_FAIL + resp.status + ' ' + resp.statusText + ' ');
            }

            if (typeof callback === 'function'){
                callback(userInfo);
            }
            
        });
    }

    // used both to save and clear user data
    var doSaveUserData = function(data, callback){
        var contentId  = GameInfo.getContentId();
        var userId     = userInstance.getUserId();
        var userDataId = VarCheck.get(userInfo, ['gameInfo', '_id']) || '';

        var urlToCall = saveUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', userDataId)
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
            
        Network.xhr('GET', urlToCall, function(resp, req){
            Logger.log('GamifiveSDK', 'User', 'set data', resp);

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
        Logger.info('GamifiveSDK', 'User', 'saveData', data);
        doSaveUserData(data, callback);
    }

    /**
    * clear some user's data 
    * @function clearData
    * @memberof User
    */
    this.clearData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'clearData');
        doSaveUserData(null, callback);
    }

    /**
    * loads some user's data 
    * @function loadData
    * @memberof User
    */
    this.loadData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'loadData');

        var contentId = GameInfo.getContentId();
        var userId    = userInstance.getUserId();

        var urlToCall = loadUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', '')
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
        Logger.log('GamifiveSDK', 'User', 'loadData', 'url to call', urlToCall);
        
        Network.xhr('GET', urlToCall, function(resp, req){
            
            // TODO: check
            userInfo.gameInfo = resp.response;

            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }

        });

        return userInfo.gameInfo;
    }

};

module.exports = User;