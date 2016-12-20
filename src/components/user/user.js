if(process.env.NODE_ENV === "debug"){
    var UserCheckFakeResponse = require('../../../test/mocks/userCheck');
}
import Constants from '../constants/constants';
var GameInfo  = require('../game_info/game_info');
var Location  = require('../location/location');
var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var VarCheck  = require('../varcheck/varcheck');
var VHost     = require('../vhost/vhost');
var Stargate  = require('stargatejs');

import { Utils } from 'stargatejs';
const { getType } = Utils;
import Event from '../event/event';
import { JSONPRequest } from 'http-francis';
import { store } from '../storage/storage';
var API = require('../api/api');
var DOMUtils  = require('../dom/dom-utils');
var NewtonService = require('../newton/newton');
var state = require('../state/state');

/**
* User module
* @namespace User
*/
var User = function(){

    var userInstance = this;
    var userInfo = {
        gameInfo:{
            CreatedAt: new Date(0).toISOString(),
            UpdatedAt: new Date(0).toISOString(),
            ProductId: null,
            contentId: null,
            domain: null,
            Creator: null,
            _id: null,
            info: null
        }
    };
    var favorites = [];
    Event.on('INIT_START', function(action){
        state.init.pending = true;
    });

    Event.on('INIT_FINISHED', function(action){        
        state.init.pending = false;
        state.init.finished = true;
    });

    Event.on('REGISTER_USER_DATA_PROMISE', function(userDataPromise){
        state.userDataPromise = userDataPromise;
    });

    Event.on('USER_DATA_FETCH_END', function(){
        state.userDataTask.isFetching = false;
        return onUserDataCallback(userInfo.gameInfo.info);
    });

    Event.on('USER_DATA_FETCH_START', function(){
        state.userDataTask.isFetching = true;
    });

    Event.on('USER_DATA_SAVE_START', function(){
        state.userDataTask.isSaving = true;
    });

    Event.on('USER_DATA_SAVE_END', function(){
        state.userDataTask.isSaving = false;
    });

    // retro compatibility
    if(window.GamifiveInfo && window.GamifiveInfo.user){
        Logger.info("GamifiveSDK:Load userInfo from in page data");
        let userInfoCloned = JSON.parse(JSON.stringify(window.GamifiveInfo.user));
        userInfo = {...userInfo, ...userInfoCloned};    
        if(getType(userInfo.gameInfo.info) === 'string'){
            try{
                userInfo.gameInfo.info = JSON.parse(userInfo.gameInfo.info);
            } catch(e){
                userInfo.gameInfo.info = null;
            }
        }
    }

    var onUserDataCallback = function(){};

    this.getInfo = function(){
        return userInfo || {};
    };

    /**
    * returns a single value of userInfo, given its key
    * @function get
    * @memberof User
    * @param {String} key the name of the value to be returned
    */
    this.get = function(key){
        return userInfo[key];
    };

    /**
    * resets userInfo
    * @function reset
    * @memberof User
    */
    this.reset = function(){
        userInfo = {};
    };    

    this.getUserId = function(){
        return userInfo.user;
    };

    /**
    * fetches the necessary info about the User (usercheck)
    * @function load
    * @memberof User
    */
    this.fetch = function(callback){
        // This condition is important beacause when 
        // i'm loading the game from disk i don't have that damn cookies        
        if (Stargate.checkConnection().type === 'online' 
            && window.location.protocol !== 'cdvfile:'){            
            
            var userInfoUrl = VHost.get('MOA_API_USER_CHECK');
            var _hyb = Stargate.isHybrid() ? 1 : 0; 
            userInfoUrl.replace(':HYBRID', _hyb);            
            
            // userInfoUrl = userInfoUrl.replace(":TS", "");
            return Network.xhr('GET', userInfoUrl).then(function(resp, req){
                if(!!resp && resp.success){
                    let responseData;
                    if (getType(resp.response) === 'string'){
                        responseData = JSON.parse(resp.response);
                    }
                    userInfo = {...userInfo, ...responseData};
                    Logger.log('GamifiveSDK', 'User', 'load complete');
                } else {
                    Logger.warn(Constants.ERROR_USER_FETCH_FAIL + resp.status + ' ' + resp.statusText + ' ');
                }
                return userInfo;
            });            
            
        } else {
            if(Stargate.isHybrid()){
                // The file should be saved by webapp
                var filePath = [Stargate.file.BASE_DIR, Constants.USER_JSON_FILENAME].join('');
                return Stargate.file.readFileAsJSON(filePath)
                        .then((responseData) => {
                            userInfo = {...userInfo, ...responseData};
                            if (typeof callback === 'function') { callback(userInfo); }
                            return userInfo;
                        });
            }
        }
    };
   
    this.canPlay = function(){
        if(Stargate.checkConnection().type === 'online'){
            var urlToCall = API.get('CAN_DOWNLOAD_API_URL')
                    .replace(':ID', GameInfo.getContentId());
            
            urlToCall = Utils.queryfy(urlToCall, {format:'jsonp'});

            var callDefer = new JSONPRequest(urlToCall, 5000).prom;
            return callDefer
                .then(function(result){
                    Logger.log('GamifiveSDK', 'Session', 'start', 'can play', result);
                    canPlay = result.canDownload;
                    return canPlay;
                });
        } else {
            if(Stargate.isHybrid()){
                // User can play this game?
                var daInfo = GameInfo.getInfo().game;
                var canPlay = false;
                if(daInfo.access_type){
                    canPlay = daInfo.access_type[ userInstance.getUserType() ];
                }
                return Promise.resolve(canPlay);
            }
        }
    };

    /**
     * get user favourites from api
     * @returns {Promise<Object>}
     */
    this.getFavorites = function(){
        if(Stargate.checkConnection().type !== 'online'){
             Logger.warn('Cannot load favorites because offline'); 
             return Promise.resolve(favorites); 
        }
        var GET_LIKE = API.get('USER_GET_LIKE');
        var query = {
            user_id: userInstance.getUserId(),
            size: 51
        };
        
        if(query.user_id === "" || typeof query.user_id === 'undefined'){
            return Promise.resolve(favorites);
        }

        var url = Utils.queryfy(GET_LIKE, query);
        return Network.xhr('GET', url).then(function(resp){
            try{
                favorites = JSON.parse(resp.response);
                Logger.info('Favourites loaded', favorites);
            } catch(e){
                Logger.warn("Fail to load user favorites", resp);
            }
            return favorites;
        });
    };
    
    /**
     * verify if the game is in the user favourites
     * @param {String} gameId - the game id to verify
     * @returns {boolean}
     */
    this.isGameFavorite = function(gameId){
        return favorites.some(function(gameObject){ return gameObject.id === gameId});
    };

    /**
    * saves some user's data
    * @public
    * @function saveData
    * @param {Object} info - should be an object
    * @param {Function} callback - call when finshed 
    * @memberof User
    * @returns {Promise}
    */
    this.saveData = function(info, callback=function(){}){        
        if(getType(info) === 'string'){            
            Logger.warn("GamifiveSDK:The data to be saved should be an object! got a:", getType(info));
            try{
                Logger.warn("GamifiveSDK:try to parse the string");
                info = JSON.parse(info);
            } catch(e){
                Logger.error("GamifiveSDK:could not save the data: not even json parseable", info);
                info = null;
                return false;
            }
        }

        userInfo.gameInfo = {...userInfo.gameInfo, info:info, UpdatedAt: new Date().toISOString() };

        if(state.init.pending && !state.init.finished){
            Event.on('INIT_FINISHED', function(){
                userInstance.setUserData();
            });
        } else if(!state.init.pending && state.init.finished) {
            if(!state.userDataTask.isFetching && !state.userDataTask.isSaving){
                userInstance.setUserData();
            } else {
                Logger.warn("GamifiveSDK: You can't save on server while a load or save operation is occurring");
            }
        } else {
            Logger.warn("GamifiveSDK: you can't call saveUserData before init. You should 1) GamifiveSDK.init 2) GamifiveSDK.loadUserData 3) then you can save");
        }
    };

    this.getUserData = function(){
        Event.trigger('USER_DATA_FETCH_START');
        return Promise.all([
            getUserDataFromLocal(), 
            getUserDataFromServer()
        ]).then(syncUserData)
          .then(function(newGameInfo){
                    if(newGameInfo){
                        userInfo.gameInfo = newGameInfo;
                    }
                    Event.trigger('USER_DATA_FETCH_END');
                    Event.trigger('REGISTER_USER_DATA_PROMISE', null);
                    return userInfo.gameInfo.info;
                });
    }

    this.setUserData = function(){
        Logger.info('GamifiveSDK', 'User', 'saveData', userInfo.gameInfo.info);
        Event.trigger('USER_DATA_SAVE_START');
        return Promise.all([
            setUserDataOnLocal(userInfo.gameInfo),
            setUserDataOnServer(userInfo.gameInfo)
        ]).then(function(){
            Event.trigger('USER_DATA_SAVE_END');
        });
    }

    /**
    * Loads user's game progress
    * @function loadData    
    * @memberof User
    * @param callback    
    * @returns {Promise|Object}
    */
    this.loadData = function(callback){
        if(!callback){
            callback = function(){}
            /** Old implementation */
            Logger.warn("GamifiveSDK: loadUserData() is deprecated from v2, please call loadUserData(callback)");
            if(getType(userInfo.gameInfo.info) === 'object' && Object.keys(userInfo.gameInfo.info).length === 0){
                return undefined;
            }
            return userInfo.gameInfo.info;
        }
        onUserDataCallback = callback;
        
        Logger.info('GamifiveSDK', 'User', 'loadData');
        if(state.init.pending && !state.init.finished){
            if(!state.userDataTask.isFetching && !state.userDataTask.isSaving){
                Event.trigger('REGISTER_USER_DATA_PROMISE', userInstance.getUserData);
            }
        } else if(!state.init.pending && state.init.finished){
            if(!state.userDataTask.isFetching && !state.userDataTask.isSaving){
                return userInstance.getUserData();
            }
        }
    };
    
    /**
     * Synchronize the local and server gameInfo object
     * @param {Array} results - the local and the server gameinfo object
     * @returns {Object} return the most updated gameInfo object
     */
    function syncUserData(results){
        Logger.info("GamifiveSDK: sync userData");
        let [localGameInfo, serverGameInfo] = results;

        if(localGameInfo && serverGameInfo){
            let localUpdatedAt = new Date(localGameInfo.UpdatedAt);
            let serverUpdatedAt = new Date(serverGameInfo.UpdatedAt);
            /**
             * This is the unique _id that in newton stands for userid-gameid object
             * and should always be added to the request otherwise php try to set on newton with a POST and not
             * with a PATCH resulting in a newton error 'Duplicate key error'
             */
            localGameInfo._id = serverGameInfo._id;

            // local is more relevant
            if(localUpdatedAt > serverUpdatedAt){
                Logger.info("GamifiveSDK: sync userData", "local won");
                return localGameInfo;    
            } else if(localUpdatedAt < serverUpdatedAt){
                // server is more relevant
                Logger.info("GamifiveSDK: sync userData", "server won");
                return serverGameInfo;
            } else if(localUpdatedAt === serverUpdatedAt){
                Logger.info("GamifiveSDK: sync userData", "same timestamp!");
                return localGameInfo;
            }
        } else if(localGameInfo && !serverGameInfo){
            Logger.info("GamifiveSDK: sync userData", "local won", "no serverGameInfo");
            return localGameInfo;
        } else if(!localGameInfo && serverGameInfo){
            Logger.info("GamifiveSDK: sync userData", "server won", "no localGameInfo");
            return serverGameInfo;
        }
    }

    /**
    * Clear some user's data
    *
    * @function clearData
    * @memberof User
    * @param {Function} callback - called when finished
    */
    this.clearData = function(callback){
        Logger.info('GamifiveSDK', 'clearUserData');
        // delete from server and on local
        userInfo.gameInfo = {...userInfo.gameInfo, info: null, UpdatedAt: new Date().toISOString()};
        return Promise.all([
            setUserDataOnServer(userInfo.gameInfo), 
            setUserDataOnLocal(userInfo.gameInfo)
        ]).then(callback);
    };

    /**
     * Get the user type: guest(unlogged) free(facebook) or premium(subscribed)
     * @returns {String}
     */
    this.getUserType = function(){
        if(!userInfo.user){
            return 'guest';
        } else if(!userInfo.subscribed) {
            return 'free';
        } else if(userInfo.subscribed) {
            return 'premium';
        }
    };

    function parseUserDataResponse(resp){
        if(resp.success){
            var responseData = resp.response;
            try{
                responseData = JSON.parse(responseData);
            } catch(e){
                Logger.error('Fail to get ', resp);
                throw e;
            }
            // First time could be like this: {response:{data:null}}                   
            var data = VarCheck.get(responseData, ['response', 'data']);
            if(data && getType(data) === 'array' && data.length > 0){
                var parsed = undefined;
                try{
                    data[0].info = JSON.parse(data[0].info);
                } catch(e){
                    data[0].info = null;
                    Logger.warn("GamifiveSDK cannot parsed userData", e);
                }
                return data[0];
            }
        }
    }

    /**
     * Get UserData from server
     * @param {Object} params
     * @param {String} params.userId
     * @param {String} params.contentId
     * @returns {Promise<Object>}
     */
    function getUserDataFromServer(){
        if(userInstance.getUserType() === 'guest'){
            Logger.log('GamifiveSDK', 'userData cannot not get on server: user not logged');
            return Promise.resolve(userInfo.gameInfo);
        }

        if (!VHost.get('MOA_API_APPLICATION_OBJECTS_GET')){ return Promise.resolve(userInfo.gameInfo);}
        var loadUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_GET');
        
        var contentId  = GameInfo.getContentId();
        var userId     = userInstance.getUserId();
        var userDataId = userInfo.gameInfo._id || '';
        var urlToCall = loadUserDataUrl
                            .replace(':QUERY', JSON.stringify({contentId: contentId}))
                            .replace(':ID', userDataId)
                            .replace(':ACCESS_TOKEN', '')
                            .replace(':EXTERNAL_TOKEN', userId)
                            .replace(':COLLECTION', 'gameInfo');

        // unique parameter in qs to avoid cache 
        urlToCall += '&_ts=' + new Date().getTime() + Math.floor(Math.random() * 1000);
        Logger.log('GamifiveSDK', 'User', 'getUserDataFromServer', 'url to call', urlToCall);
             
        return Network.xhr('GET', urlToCall, {withCredentials: true})
            .then(parseUserDataResponse);
    }

    /**
     * Set UserData on Server
     * @param {Object} data - the data to be saved in gameInfo format
     * @param {String} data.info - a json object
     * @returns {Promise<Object>} - the gameInfo object with data and metadata
     */
    function setUserDataOnServer(data){
        if(userInstance.getUserType() === 'guest'){
            Logger.log('GamifiveSDK', 'userData cannot not be set on server: user not logged');
            return Promise.resolve(userInfo.gameInfo);
        }

        if (!VHost.get('MOA_API_APPLICATION_OBJECTS_SET')){
            Logger.log('GamifiveSDK', 'userData cannot not be set on server: api endpoint disabled');
            return Promise.resolve(userInfo.gameInfo);
        }
        let contentId  = GameInfo.getContentId();
        let userId     = userInstance.getUserId();
        let userDataId = userInfo.gameInfo._id || '';

        let saveUserDataUrl = VHost.get('MOA_API_APPLICATION_OBJECTS_SET');
        let APPLICATION_OBJECT_SET_API = saveUserDataUrl.split("?")[0];
        let infoSerialized;
        if(getType(data.info) === 'object' || getType(data.info) === "null"){
            infoSerialized = JSON.stringify(data.info);
        } else {
            Logger.warn("GamifiveSDK: bad info type: ", getType(data.info));
        }
        
        let queryObject = Utils.dequeryfy(saveUserDataUrl);
        
        /* 
        http://resources.buongiorno.com/lapis/apps/application-object.set?
            external_token=:EXTERNAL_TOKEN
            &access_token=:ACCESS_TOKEN
            &collection=:COLLECTION
            &id=:ID
            &white_label=ww_appsworld
            &fw=gamifive
            &vh=appsworld.gamifive-app.com 
        */
        
        let body = {
            access_token: '',
            external_token: userId,
            id: userDataId,
            info: infoSerialized,
            domain: Location.getOrigin(), 
            contentId: contentId,
            collection: 'gameInfo'
        }
        let newBody = {...queryObject, ...body};
        
        let headers = {'Content-type': 'application/x-www-form-urlencoded'};

        let urlEncoded = Utils.queryfy("", newBody).replace("?","");
        Logger.log('GamifiveSDK', 'try to set on server', APPLICATION_OBJECT_SET_API, newBody);
        
        return Network.xhr('POST', APPLICATION_OBJECT_SET_API, {data:urlEncoded, headers: headers, withCredentials: true})
        .then(function(resp){
            if(resp.success){
                var newtonResponse = JSON.parse(resp.response);
                if(newtonResponse.response.data){
                    Logger.log('GamifiveSDK', 'userData set with success on server');
                } else {
                    // NEWTON error
                    Logger.warn('GamifiveSDK', 'userData FAIL to be set on server', newtonResponse.response.message);
                }
            } else {
                // PHP error
                Logger.warn('GamifiveSDK', 'userData FAIL to be set on server', resp.response);
            }
            return data;
        });
    }

    function setUserDataOnLocal(){
        if(userInstance.getUserType() === 'guest'){
            Logger.warn('GamifiveSDK: User not logged cannot save userData');
            return Promise.resolve(userInfo.gameInfo);
        }
        let key = `${userInstance.getUserId()}-${GameInfo.getContentId()}`;
        return store.setItem(key, userInfo.gameInfo);
    }

    function getUserDataFromLocal(){
        if(userInstance.getUserType() === 'guest'){
            Logger.warn('GamifiveSDK: User not logged cannot get userData');
            return Promise.resolve(userInfo.gameInfo);
        }
        let key = `${userInstance.getUserId()}-${GameInfo.getContentId()}`;
        return store.getItem(key);
    }

    this.toggleLike = function(){
        var SET_LIKE = API.get('USER_SET_LIKE');
        var DELETE_LIKE = API.get('USER_DELETE_LIKE');
        
        var isFavourite = userInstance.isGameFavorite(GameInfo.getContentId());

        var query = {
            content_id: GameInfo.getContentId(),
            user_id: userInstance.getUserId() 
        };

        var remoteOperation;
        if(isFavourite){
            var deleteUrl = Utils.queryfy(DELETE_LIKE, query);
            remoteOperation = Network.xhr('POST', deleteUrl);
        } else {
            var setUrl = Utils.queryfy(SET_LIKE, query);
            remoteOperation = Network.xhr('GET', setUrl);
        }

        remoteOperation.then(function(resp){            
            if(resp.response === ''){
                // DELETE OK
                var temp = favorites.filter(function(gameObject){
                    return gameObject.id !== GameInfo.getContentId()
                });
                favorites = temp;
                DOMUtils.updateFavoriteButton(false);
            } else {
                // SET OK
                var responseData = JSON.parse(resp.response);                
                favorites.push({ id: responseData.object_id });
                DOMUtils.updateFavoriteButton(true);
            }
        });
    };

    this.getAvatar = function(){        
        return {
            src: userInfo.avatar || '', 
            name: userInfo.nickname || ''
        }
    }

    this.getNickname = function(){
        return userInfo.nickname || '';
    }

    if(process.env.NODE_ENV === "debug"){
        this.fetch = function(callback){
            userInfo = {...userInfo, ...UserCheckFakeResponse};
            let userType = Location.getQueryString()['user_type'];
            if(!userType || userType === 'guest'){
                userInfo.user = null;
                userInfo.subscribed = false;
            } else if(userType === 'free') {
                userInfo.user = Location.getQueryString()['user_id'] || 'gfsdk_fake_user';
                userInfo.subscribed = false;
            } else if(userType == 'premium'){
                userInfo.user = Location.getQueryString()['user_id'] || 'gfsdk_fake_user';
                userInfo.subscribed = true;
            }

            callback ? callback() : null; 
            return Promise.resolve(userInfo);
        }

        this.getFavorites = function(){
            return Promise.resolve({});
        }

        this.canPlay = function(){
            return Promise.resolve(true);
        }
    }


    if (process.env.NODE_ENV === "testing"){
        var original = {
            Stargate: null,
            User: null,
            VHost: null,
            GameInfo: null,
            Menu: null
        };

        this.setUserDataOnServer = setUserDataOnServer;
        this.getUserDataFromServer = getUserDataFromServer;
        this.setUserDataOnLocal = setUserDataOnLocal;
        this.getUserDataFromLocal = getUserDataFromLocal;
        this.syncUserData = syncUserData;

        this.setMock = function(what, mock){            
            switch(what){
                case "User":
                    original.User = require('../user/user');
                    User = mock;
                    break;
                case "Stargate":
                    original.Stargate = require('stargatejs');
                    Stargate = mock;
                    break;
                case "VHost":
                    original.VHost = require('../vhost/vhost');
                    VHost = mock;
                    break;
                case "GameInfo":
                    original.GameInfo = require('../game_info/game_info');
                    GameInfo = mock;
                    break;
                case "Menu":
                    original.Menu = require('../menu/menu');
                    Menu = mock;
                    break;
                default:
                    break;
            }
        };

        this.unsetMock = function(what){
            if (!original[what]) return;
            switch(what){
                case "User":
                    User = original.User;
                    original.User = null;
                    break;
                case "Stargate":
                    Stargate = original.Stargate;
                    original.Stargate = null;
                    break;
                case "VHost":
                    VHost =  original.VHost;
                    original.VHost = null;
                    break;
                case "GameInfo":
                    GameInfo = original.GameInfo;
                    original.GameInfo = null;
                    break;
                case "Menu":
                    Menu = original.Menu;
                    original.Menu = null;
                    break;
                default:
                    break;
            }
        }
    }
};

module.exports = new User();