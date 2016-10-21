var API = require('../api/api');
var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var Constants = require('../constants/constants');
var VHostKeys = require('../../../gen/vhost/vhost-keys.js');
var Promise = require('promise-polyfill');
var Stargate  = require('stargatejs');

/**
* VHost module
* @namespace VHost
* @version 0.9
*/
var VHost = new function(){

    var vHostInstance = this;
    var vHost;
    var gameSDKVHostUrl;
    var afterLoadPromise;    
    
    var VHOST_PATH = '';
    /**
    * resets VHost internal data
    * @function reset
    * @memberof VHost
    */
    this.reset = function(){
        vHost = undefined;
    }
    
    /**
    * downloads VHost internal data
    * @function load
    * @memberof VHost
    */
    this.load = function(){
        if(Stargate.isHybrid()){
            VHOST_PATH = Stargate.file.BASE_DIR + Constants.VHOST_JSON_FILENAME;
        }

        if (Stargate.isHybrid() && Stargate.checkConnection().type === 'offline'){
            afterLoadPromise = Stargate.file.fileExists(VHOST_PATH)
                .then(function(exists){                        
                        if (exists){
                            return Stargate.file.readFileAsJSON(VHOST_PATH);
                        }                        
                        throw new Error(Constants.ERROR_VHOST_LOAD_FAIL + ' file not exists');
                })
                .then(function(json){                    
                    vHost = json;
                    vHost['IMAGES_SPRITE_GAME'] = ["../..", 'gameover_template', 'sprite.png'].join('/');
                    Logger.log(vHost);                        
                });
        } else if(Stargate.checkConnection().type === 'online') {
            var urlToCall = API.get('VHOST_API_URL') + VHostKeys.join(',');            
            Logger.log('GamifiveSDK', 'VHost', 'load url', urlToCall);
            
            afterLoadPromise = Network.xhr('GET', urlToCall)
                .then(function(resp){
                    if (!!resp && typeof resp.response !== 'undefined'){                                            
                        vHost = resp.response;
                        if (typeof vHost === typeof ''){
                            Logger.log('GamifiveSDK', 'VHost', 'load response parsing it', resp.response);
                            vHost = JSON.parse(vHost);
                        }
                    }
                    Logger.log('GamifiveSDK', 'VHost', 'loaded');                    
            });
        } else {
            
        }
        return afterLoadPromise;
    }

    /**
     * Persist vhost on file or whatever
     * returns {Promise}
     */
    function vHostSave(){
        Logger.info('GamifiveSDK', 'VHost save');
        return Stargate.file.write(VHOST_PATH, JSON.stringify(vHost));
    }

    /**
    * sets a callback to be fired after the VHost has been loaded
    * @function afterLoad
    * @memberof VHost
    */
    this.afterLoad = function(callback){
        if (afterLoadPromise){
            afterLoadPromise.then(callback);
        }        
    }

    /**
    * gets a VHost value given its key
    * @function get
    * @memberof VHost
    */
    this.get = function(key){
        if (typeof vHost === 'undefined'){
            Logger.error('GamifiveSDK', 'VHost', 'get', 'cannot get "' + key + '" before loading the VHost');
            return undefined;
        }
        return vHost[key];
    }

    /**
     * get all VHOST loaded keys
     * @returns {object}
     */
    this.getInfo = function(){
        return vHost;
    }

    if (process.env.NODE_ENV === "testing"){
        var original = {
            Stargate: null,
            User: null,
            VHost: null,
            GameInfo: null,
            Menu: null
        };
        
        this.setMock = function(what, mock){            
            switch(what){
                case "User":
                    original.User = require('../user/user');;
                    User = mock;
                    break;
                case "Stargate":
                    original.Stargate = require('stargatejs');;
                    Stargate = mock;
                    break;
                case "VHost":
                    original.VHost = require('../vhost/vhost');
                    VHost = mock;
                    break;
                case "GameInfo":
                    original.GameInfo = require('../game_info/game_info');
                    GameInfo = mock
                    break;
                case "Menu":
                    original.Menu = require('../menu/menu');
                    Menu = mock;
                    break;
                default:
                    break;
            }
        }

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

module.exports = VHost;