var Session = require("../src/components/session/session");

describe("A description",function(){
    
    it("Public interface is defined", function(){
        expect(Session.init).toBeDefined();
        expect(Session.getConfig).toBeDefined();
        expect(Session.start).toBeDefined();
        expect(Session.onStart).toBeDefined();
        expect(Session.end).toBeDefined();
        expect(Session.onPauseEnter).toBeDefined();
        expect(Session.onPauseExit).toBeDefined();
    });

    
});