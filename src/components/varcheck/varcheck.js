
/**
* Utility module for type checking and validation
* @namespace VarCheck
* @version 0.9
*/
var VarCheck = new function(){

    /**
    * Traverses an object iteratively through a list of properties (accessors). 
    * Example: 
    *
    * <p>var obj = {
    *   1: {
    *       2: {
    *           'a': true
    *       }
    *   }
    * }; 
    * </p>
    * <p> VarCheck.get(obj, [1, 2, 'a']); // true </p>
    * <p> VarCheck.get(obj, [1, 2, 'b']); // undefined </p>
    * @function get
    * @memberof VarCheck
    * @param {Object} root the object to traverse
    * @param {Array} propList the list of properties we expect to find in the object
    */
    this.get = function(root, propList){
        var node = root;

        for (var i=0; i<propList.length; i++){
            if (typeof node[propList[i]] === undefined){
                return undefined;
            } else {
                node = node[propList[i]];
            }
        }

        return node;
    }
}

module.exports = VarCheck;