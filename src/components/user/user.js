var Constants = require('../constants/constants');
var GA        = require('../ga/ga');
var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var Newton    = require('../newton/newton');
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
        if (typeof userInfo === 'undefined'){
            throw Constants.ERROR_USER_GET_BEFORE_FETCH;
        }
        return userInfo[key];
    }

    /**
    * resets userInfo
    * @function reset
    * @memberof User
    */
    this.reset = function(){
        userInfo = undefined;
    }

    /**
    * fetches the necessary info about the User (usercheck)
    * @function load
    * @memberof User
    */
    this.fetch = function(callback){
        Logger.log('GamifiveSDK', 'User', 'fetch attempt');

        Network.xhr('GET', userInfoUrl, function(resp, req){
            Logger.log('GamifiveSDK', 'User', 'fetch complete', resp);

            if (typeof userInfo === 'undefined'){
                userInfo = {};
            }

            // TODO: check this
            if(!!resp && typeof resp.response !== 'undefined'){
                for (var key in resp.response){
                    userInfo[key] = resp.response[key];
                }
            }

            if (typeof callback === 'function'){
                callback(userInfo);
            }
            
        });
    }

    // used both to save and clear user data
    var doSaveUserData = function(data, callback){
        var contentId  = GameInfo.get('contentId');
        var userId     = userInfo.userId;
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
    * clear some user's data 
    * @function clearData
    * @memberof User
    */
    this.clearData = function(callback){
        Logger.info('GamifiveSDK', 'User', 'clearUserData');
        doSaveUserData(null, callback);
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
            userInfo.gameInfo = resp.response;

            if (typeof callback === 'function'){
                callback(userInfo.gameInfo);
            }

        });

        return userInfo.gameInfo;
    }

};

module.exports = User;