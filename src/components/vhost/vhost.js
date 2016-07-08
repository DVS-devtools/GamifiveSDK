var Logger    = require('../logger/logger');
var Network   = require('../network/network');
var Event     = require('../event/event');
var Constants = require('../constants/constants');
var VHostKeys = require('../../../gen/vhost/vhost-keys.js');
var Stargate  = require('../../../node_modules/stargate/src/index.js');

/**
* VHost module
* @namespace VHost
* @version 0.9
*/
var VHost = new function(){

    var vHostInstance = this;

    var vHost;
    var gameSDKVHostUrl = Constants.VHOST_API_URL;

    var initSG = Stargate.initialize();
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

        if (Stargate.isHybrid() && Stargate.checkConnection().type === 'offline'){
            // this.load waits the stargate initialize
            VHOST_PATH = window.cordova.file.applicationStorageDirectory + 'vhost.json';
            Stargate.file.fileExists(VHOST_PATH)
                    .then(function(exists){
                        if (exists){
                            return Stargate.file.readFileAsJSON(VHOST_PATH);
                        }
                        return {};
           }).then(function(json){
               vHost = json;
               Event.trigger(Constants.AFTER_LOAD_EVENT_KEY);
           });
        }

        var urlToCall = gameSDKVHostUrl + VHostKeys.join(',');
        Logger.log('GamifiveSDK', 'VHost', 'load url');

        Network.xhr('GET', urlToCall, function(resp){

            if (!!resp && typeof resp.response !== 'undefined'){
                Logger.log('GamifiveSDK', 'VHost', 'load response', resp);
                vHost = resp.response;
                if (typeof vHost === typeof ''){
                    vHost = JSON.parse(vHost);
                }
            }

            Logger.log('GamifiveSDK', 'VHost', 'load', vHost);            
            Event.trigger(Constants.AFTER_LOAD_EVENT_KEY);
            if (Stargate.isHybrid()){
                vHostSave();
            }
        });
    }

    /**
     * Persist vhost on file or whatever
     * returns {Promise}
     */
    function vHostSave(){
        Logger.info('GamifiveSDK', 'VHost', 'save', vHost);
        return Stargate.file.write(VHOST_PATH, JSON.stringify(vHost));
    }

    /**
    * sets a callback to be fired after the VHost has been loaded
    * @function afterLoad
    * @memberof VHost
    */
    this.afterLoad = function(callback){
        Event.bind(Constants.AFTER_LOAD_EVENT_KEY, callback);
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

};

module.exports = VHost;