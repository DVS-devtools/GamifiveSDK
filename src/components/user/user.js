var Constants = require('../constants/constants');
var GA        = require('../ga/ga');
var GameInfo  = require('../game_info/game_info');
var Location  = require('../location/location');
var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var VarCheck  = require('../varcheck/varcheck');
var VHost     = require('../vhost/vhost');
var Stargate  = require('stargatejs');

/**
* User module
* @namespace User
* @version 0.9
*/
var User = new function(){

    var userInstance = this;

    var userInfo;

    this.getInfo = function(){
        return userInfo || {};
    }

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
        Logger.log('GamifiveSDK', 'User', 'fetch attempt', Stargate.checkConnection());
                
        if (Stargate.checkConnection().type === 'online'){
            Logger.info('GamifiveSDK', 'User', 'online', Stargate.checkConnection());

            var userInfoUrl = VHost.get('MOA_API_USER_CHECK');
            if (Stargate.isHybrid()){
                userInfoUrl.replace(":HYBRID", 1);
            } 
            
            // userInfoUrl = userInfoUrl.replace(":TS", "");            
            return Network.xhr('GET', userInfoUrl).then(function(resp, req){

                if(!!resp && resp.success){
                    var responseData = resp.response;

                    if (typeof responseData == typeof ''){
                        responseData = JSON.parse(responseData);
                    }                    

                    for (var key in responseData){
                        userInfo[key] = responseData[key];
                    }
                    Logger.log('GamifiveSDK', 'User', 'load complete');

                    if(Stargate.isHybrid()){                        
                        var filePath = [Stargate.file.BASE_DIR, Constants.USER_JSON_FILENAME].join("");
                        return Stargate.file.write(filePath, userInfo);                        
                    }
                } else {
                    Logger.warn(Constants.ERROR_USER_FETCH_FAIL + resp.status + ' ' + resp.statusText + ' ');
                }

                if (typeof callback === 'function'){
                    userInstance.loadData(function(){
                        callback(userInfo);
                    });
                }

            });
            
        } else if (Stargate.checkConnection().type === 'offline' && Stargate.isHybrid()) {
            Logger.warn('GamifiveSDK', 'User', 'offline', Stargate.checkConnection());
            var filePath = [Stargate.file.BASE_DIR, Constants.USER_JSON_FILENAME].join("");
            return Stargate.file.readFileAsJSON(filePath)
               .then(function(responseData) {                   
                    for (var key in responseData){
                        userInfo[key] = responseData[key];
                    }
                    callback(userInfo);
                });
        }
    }

    /**
     * doSaveUserData makes the server call
     * @private
     * @param {object} data - the data to save. if null delete the data
     * @param {function} callback - callback fullfilled with userdata {object}
     */
    var doSaveUserData = function(data, callback){
        var contentId  = GameInfo.getContentId();
        var userId     = userInstance.getUserId();
        var userDataId = VarCheck.get(userInfo, ['gameInfo', '_id']) || '';

        if (typeof userInfo.gameInfo === 'undefined'){
            userInfo.gameInfo = {};
        }
        
        userInfo.gameInfo.info = data;       
        var saveUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_SET');
        var urlToCall = saveUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', userDataId)
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        urlToCall += "&info=" + encodeURIComponent(JSON.stringify(data))
                                + "&domain=" + encodeURIComponent(Location.getOrigin())
                                + "&contentId=" + GameInfo.getContentId();

        /**
        * ATTENZIONE 
        * è una get ma in realtà POSTa i dati dello user sul server
        */
        return Network.xhr('GET', urlToCall, function(resp, req){
            Logger.log('GamifiveSDK', 'Data User', 'set', resp);
            
            if (typeof callback === 'function'){
                callback(userInfo.gameInfo.info);
            }
            
        });
    }

    /**
    * saves some user's data
    * @public
    * @function saveData
    * @memberof User
    */
    this.saveData = function(data, callback){
        Logger.info('GamifiveSDK', 'User', 'saveData', data);
        doSaveUserData(data, callback);
    }

    /**
    * clear some user's data
    *
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
    * @param callback
    * @param async - if set to true returns a promise
    * @returns {promise|object}
    */
    this.loadData = function(callback, async){
        Logger.info('GamifiveSDK', 'User', 'loadData');
        if (userInfo){ throw Constants.ERROR_USER_MISSING_INFO;}

        if (!userInfo.logged){ 
            if(async){
                return Promise.resolve({});
            } else {
                return {};
            }
        }

        var contentId = GameInfo.getContentId();
        var userId    = userInstance.getUserId();
        var loadUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_GET');

        var urlToCall = loadUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', '')
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random()*1000);
        Logger.log('GamifiveSDK', 'User', 'loadData', 'url to call', urlToCall);        
        
        var loadTask = Network.xhr('GET', urlToCall, function(resp, req){

            var responseData = resp.response;
            try{
                responseData = JSON.parse(responseData);
            } catch(e){
                Logger.error(e);
                throw e;
            }

            userInfo.gameInfo = VarCheck.get(responseData, ['response', 'data', 0]);
            Logger.log('GamifiveSDK', 'User', 'loadData', 'response data', userInfo.gameInfo.info)

            if (typeof callback === 'function'){
                callback(userInfo.gameInfo.info);
            }

        });

        if (async){
            return loadTask;
        }
        
        if (!userInfo.gameInfo){
            userInfo.gameInfo = {};
        }
        return userInfo.gameInfo.info;
    }

    this.syncUserData = function(){
        // get data from server
        // if local.data > server.data
        // -- save on server
        // else
        // -- save on local        
    }

    if(process.env.NODE_ENV === "testing"){
        var original = { Stargate: null };
        this.setStargateMock = function(theMock){            
            original.Stargate = require('stargatejs');
            Stargate = theMock;
        }

        this.unsetStargateMock = function(){
            if(!original.Stargate){ return; }
            console.log("Unmocking stargate");
            Stargate = original.Stargate;
            original.Stargate = null;
        }
    }
};

module.exports = User;