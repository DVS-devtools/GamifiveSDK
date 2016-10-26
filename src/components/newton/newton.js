import NewtonAdapter from 'newton-adapter';

export default new function NewtonService(){

    var methods = Object.getOwnPropertyNames(NewtonAdapter);
    var self = this;

    methods.map(function(methodName, index, arr){        
        if (typeof NewtonAdapter[methodName] !== 'function'){ return; }
        self[methodName] = function(){
            return NewtonAdapter[methodName].apply(NewtonAdapter, arguments);
        }
    });
}