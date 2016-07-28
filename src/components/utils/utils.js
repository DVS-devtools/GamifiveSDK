/**
 * Iterator
 *
 * @alias module:src/modules/Utils.Iterator
 * @example
 * var myArray = ["pippo", "pluto", "paperino"];
 * var it = Utils.Iterator(myArray);
 * it.next().value === "pippo"; //true
 * it.next().value === "pluto"; //true
 * it.next(true).value === "paperino" //false because with true you can reset it!
 * @param {Array} array - the array you want to transform in iterator
 * @returns {Object} - an iterator-like object
 * */
function Iterator(array){
    var nextIndex = 0;

    return {
        next: function(reset) {
            if (reset){ nextIndex = 0; }
            return nextIndex < array.length ?
            { value: array[nextIndex++], done: false } :
            { done: true };
        }
    };
}

/**
 * A function to compose query string
 *
 * @alias module:src/modules/Utils.composeApiString
 * @example
 * var API = "http://jsonplaceholder.typicode.com/comments"
 * var url = composeApiString(API, {postId:1});
 * // url will be "http://jsonplaceholder.typicode.com/comments?postId=1"
 * @param {Strinq} _api
 * @param {Object} params - a key value object: will be append to <api>?key=value&key2=value2
 * @returns {String} the string composed
 * */
function queryfy(_api, query){
    var previousQuery = dequeryfy(_api);
    var qs = '', 
        finalQuery,
        api = _api.slice(0);
    

    if (api.indexOf('?') > -1){
        api = api.slice(0, api.indexOf('?'));        
    }

    api += '?';    
    finalQuery = extend(previousQuery, query);

    for (var key in finalQuery){                
        qs += encodeURIComponent(key);
        // if a value is null or undefined keep the key without value
        if (finalQuery[key]){ qs += '=' + encodeURIComponent(finalQuery[key]); }
        qs += '&';
    }
    
    if (qs.length > 0){
        qs = qs.substring(0, qs.length - 1); // chop off last
    }
    return [api, qs].join('');
}

/**
 * A function to dequerify query string
 *
 * @alias module:src/modules/Utils.dequerify
 * @example
 * var url = "http://jsonplaceholder.typicode.com/comments?postId=1
 * var obj = dequerify(url); //obj is {"postId":"1"} 
 * @param {Strinq} _url 
 * @returns {Object} the object with key-value pairs, empty if no querystring is present
 * */
function dequeryfy(_url){
    var param = decodeURIComponent(_url.slice(0));
    
    var query = param.split('?')[1];
    if (!query){ return {}; }
    
    var keyvalue = query.split('&');
    
    return keyvalue.reduce(function(newObj, _keyvalue){
        var splitted = _keyvalue.split('=');
        var key = splitted[0];
        var value = splitted[1];
        newObj[key] = value;
        return newObj;        
    }, {});
}



/**
 * extend: this function merge two objects in a new one with the properties of both
 *
 * @param {Object} o1 -
 * @param {Object} o2 -
 * @returns {Object} a brand new object results of the merging
 * */
function extend(o1, o2){

    var isObject = Object.prototype.toString.apply({});
    if ((o1.toString() !== isObject) || (o2.toString() !== isObject)) {
        throw new Error('Cannot merge different type');
    }
    var newObject = {};
    for (var k in o1){
        if (o1.hasOwnProperty(k)){
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if (o2.hasOwnProperty(j)){
            newObject[j] = o2[j];
        }
    }
    return newObject;
}

/**
 * Gets the real type of an object
 * @param {any} obj - any kind of object: date, array, ecc
 * @returns {string} returns the real type of an object date for Date an array for array and so on
 */
function getType(obj){
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();    
}

module.exports = {
    Iterator:Iterator,
    extend:extend,
    queryfy:queryfy,
    dequeryfy:dequeryfy,
    getType:getType
};