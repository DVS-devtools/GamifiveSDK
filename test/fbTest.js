var Facebook = require("../src/components/fb/fb");

describe("FB",function(){

    it("FB must not be initialized", function(){
        expect(Facebook.initialized).toBe(false);
    });

    it("FB async init is defined after FB.init", function(){
        Facebook.init();
        expect(window.fbAsyncInit).toBeDefined();
    });

    it("FB is initialized after fbAsyncInit is called", function(){
        window.fbAsyncInit();

        expect(Facebook.initialized).toBe(true);
    });

});