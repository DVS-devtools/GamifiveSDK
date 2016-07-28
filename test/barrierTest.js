var Barrier   = require("../src/components/barrier/barrier");
var Constants = require("../src/components/constants/constants");

xdescribe("Barrier",function(){   

    it("should be defined", function(){
        expect(Barrier).toBeDefined();
    }); 

    it("should detect when it's complete", function(){
        var b = new Barrier('test', ['event1']);

        expect(b.isComplete()).toEqual(false);

        b.setComplete('event1');

        expect(b.isComplete()).toEqual(true);
    });

    it("should fire (multiple) callbacks onComplete", function(){
        var b = new Barrier('test', ['event1']);

        var flag1, flag2;

        expect(b.isComplete()).toEqual(false);

        b.onComplete(function(){
            flag1 = true;
        });
        
        b.onComplete(function(){
            flag2 = true;
        });

        b.setComplete('event1');

        expect(flag1).toEqual(true);
        expect(flag2).toEqual(true);
    });

    it("should throw error if keysToWait type is wrong", function(){
        var error;

        var wrongValues = [ null, undefined, 'wrong', 666];

        for (var i=0; i<wrongValues.length; i++){
            try {
                var b = new Barrier('test', wrongValues[i]);
            } catch (e){
                error = e.toString();
            }
            expect(error.indexOf(Constants.ERROR_BARRIER_NO_EVENTS) > -1).toEqual(true);   
        }
    });

    it("should throw error if keysToWait is empty", function(){
        var error;

        try {
            var b = new Barrier('test', []);
        } catch (e){
            error = e.toString();
        }
        expect(error.indexOf(Constants.ERROR_BARRIER_EMPTY_KEYS) > -1).toEqual(true);   
        
    });

    it("should throw error when completing an unknown event", function(){
        var error;
        var b = new Barrier('test', ['testKey']);

        try {
            b.setComplete('unknownKey')    
        } catch (e){
            error = e.toString();
        }
        expect(error.indexOf(Constants.ERROR_BARRIER_KEY_UNKNOWN) > -1).toEqual(true);   
        
    });

    it("should throw error when setting a wrong onComplete callback", function(){
        var error;
        var b = new Barrier('test', ['testKey']);

        var wrongValues = [ null, undefined, 'wrong', 666];

        for (var i=0; i<wrongValues.length; i++){
            try {
                b.onComplete(wrongValues[i])
            } catch (e){
                error = e.toString();
            }
            expect(error.indexOf(Constants.ERROR_BARRIER_CALLBACK_TYPE) > -1).toEqual(true);   
        }
        
    });

    it("should throw error when setting or completing a key of invalid type", function(){
        var error;
        
        try {
            var b = new Barrier('test', [2]);
        } catch (e){
            error = e.toString();
        }
        expect(error.indexOf(Constants.ERROR_BARRIER_INVALID_KEY_TYPE) > -1).toEqual(true);   

        var b = new Barrier('test', ['testKey']);
        try {
            b.setComplete(2);
        } catch (e){
            error = e.toString();
        }
        expect(error.indexOf(Constants.ERROR_BARRIER_INVALID_KEY_TYPE) > -1).toEqual(true);   
        
    });
    

});