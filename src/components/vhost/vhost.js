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
            // TODO: change in Stargate.file.BASE_DIR cause on iOS path change
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
                });
        } else if(Stargate.checkConnection().type === "online") {
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
                    if (Stargate.isHybrid()){
                        return vHostSave();
                    }                    
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

    if(process.env.NODE_ENV === "testing"){
        var original = { Stargate: null };
        this.setStargateMock = function(theMock){
            original.Stargate = Stargate;
            Stargate = theMock;
        }

        this.unsetStargateMock = function(){
            if(!original.Stargate){ return; }
            Stargate = original.Stargate;
            original.Stargate = null;
        }
    }
};

module.exports = VHost;