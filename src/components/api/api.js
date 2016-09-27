var Location = require('../location/location');
var Constants = require('../constants/constants');

module.exports = {
    get:function(key){
        if(typeof Constants[key] === 'undefined'){ throw 'No key ' + key + ' found in Constants'}
        return [Location.getOrigin(), Constants[key]].join("");
    }
};