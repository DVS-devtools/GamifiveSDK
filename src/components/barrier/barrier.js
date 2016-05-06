var Logger    = require('../logger/logger');
var Event     = require('../event/event');
var Constants = require('../constants/constants');

var BarrierId = new function(){

    var counter = 0;

    this.create = function(){
        return 'Barrier' + (counter++);
    }
}

/**
* Barrier module
* @namespace Barrier
* @version 0.9
*/
var Barrier = function(name, keysToWait){

    var barrierInstance = this;

    var barrierId = BarrierId.create();

    Logger.log('GamifiveSDK', 'Barrier', 'new', 'name: ' + name, 'id: ' + barrierId);

    var toWait = {};

    if (keysToWait === null || typeof keysToWait !== typeof []){
        throw Constants.ERROR_BARRIER_NO_EVENTS + typeof keysToWait;
    }

    if (keysToWait.length === 0){
        throw Constants.ERROR_BARRIER_EMPTY_KEYS;
    }

    var keyToAdd;
    for (var i=0; i<keysToWait.length; i++){
        keyToAdd = keysToWait[i];
        if (typeof keyToAdd !== typeof ''){
            throw Constants.ERROR_BARRIER_INVALID_KEY_TYPE + typeof keyToAdd;
        }
        Logger.log('GamifiveSDK', 'Barrier', barrierId, 'added key', keyToAdd)
        toWait[keyToAdd] = false;
    }
    delete keyToAdd;

    /**
    * returns whether the barrier is complete
    * @function isComplete
    * @memberof Barrier
    */
    this.isComplete = function(){
        for (var key in toWait){
            if (!toWait[key]){
                return false;
            }
        }
        return true;
    }
    
    /**
    * sets a callback to be fired after the Barrier has been completed
    * @function afterLoad
    * @memberof Barrier
    */
    this.onComplete = function(callback){
        if (typeof callback !== 'function'){
            throw Constants.ERROR_BARRIER_CALLBACK_TYPE + typeof callback;
        }
        Event.bind(barrierId, callback);
    }

    /**
    * tells the Barrier that the given key was completed
    * @function setComplete
    * @memberof Barrier
    */
    this.setComplete = function(key){
        if (typeof key !== typeof ''){
            throw Constants.ERROR_BARRIER_INVALID_KEY_TYPE + typeof key;
        }

        if (typeof toWait[key] === 'undefined'){
            throw Constants.ERROR_BARRIER_KEY_UNKNOWN + key;
        }
        toWait[key] = true;

        if (barrierInstance.isComplete()){
            var message = '(id: ' + barrierId + ') has been completed';
            if (!!name) {
                message = name + ' ' + message;
            }
            Logger.log('GamifiveSDK', 'Barrier', message, toWait);
            Event.trigger(barrierId);
        }
    }

};

module.exports = Barrier;