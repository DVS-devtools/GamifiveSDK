var Facebook = require("../src/components/fb/fb");

describe("FB",function(){

    it("FB must not be initialized", function(){
        expect(Facebook.isInitialized()).toEqual(false);
    });

    it("FB async init is defined after FB.init", function(done){
        Facebook.init({fbAppId: 1234});
        expect(window.fbAsyncInit).toBeDefined();
        done();
    });

    it("FB is initialized after fbAsyncInit is called", function(){
        window.fbAsyncInit();

        expect(Facebook.isInitialized()).toEqual(true);
    });

});