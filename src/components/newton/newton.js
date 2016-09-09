var NewtonAdapter = require('newton-adapter');

var NewtonService = new function(){

    var methods = Object.getOwnPropertyNames(NewtonAdapter);
    var self = this;

    methods.map(function(methodName, index, arr){        
        if (typeof NewtonAdapter[methodName] !== 'function'){ return; }
        self[methodName] = function(){
            /*if (window.location.protocol === 'cdvfile:' || 
                window.location.protocol === 'file:'){ 
                
                console.warn('Newton.js is running on cdvfile: / file: protocol!'); 
                return;
            }*/

            /* if (window.Newton === undefined){
                console.warn('Newton.js not imported');
                return;
            } */

            return NewtonAdapter[methodName].apply(NewtonAdapter, arguments);
        }
    });

}

module.exports = NewtonService;