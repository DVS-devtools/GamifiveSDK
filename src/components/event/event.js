var Logger  = require('../logger/logger');

/**
* Event manager module
* @class Event
* @version 0.9
*/
var Event = new function(){

    var eventInstance = this;
    
    var events = {};

    /**
    * fires the event associated with the specified key
    * @function trigger
    * @memberof Event
    */
    this.trigger = function(key, args){
        Logger.log('GamifiveSDK', 'Event', 'trigger', key);
        var callbackList = events[key]

        if (typeof callbackList === 'undefined'){
            // no callbacks registered, skip
            return;
        }

        for (var i=0; i<callbackList.length; i++){
            callbackList[i](args);
        }
    }

    /**
    * binds a new function to an event key
    * @function bind
    * @memberof Event
    */
    this.bind = function(key, callback){
        if (typeof callback === 'function'){

            // first callback registered for this event
            if (typeof events[key] === 'undefined'){
                events[key] = [];
            }
            events[key].push(callback);
            Logger.log('GamifiveSDK', 'Event', 'bind', 'callback registered for key "' + key + '"');
            
        } else {
            Logger.error('GamifiveSDK', 'Event', 'bind', 'callback must be a function');
        }
    }

    /**
    * unbinds all the functions from an event key
    * @function clear
    * @memberof Event
    */
    this.clear = function(key){
        events[key] = [];
    }

};

module.exports = Event;