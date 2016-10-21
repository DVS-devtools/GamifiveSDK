var NewtonAdapter = require('newton-adapter');

var NewtonService = new function(){

    var methods = Object.getOwnPropertyNames(NewtonAdapter);
    var self = this;

    methods.map(function(methodName, index, arr){        
        if (typeof NewtonAdapter[methodName] !== 'function'){ return; }
        self[methodName] = function(){
            return NewtonAdapter[methodName].apply(NewtonAdapter, arguments);
        }
    });

}

module.exports = NewtonService;