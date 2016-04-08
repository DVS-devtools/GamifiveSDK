var session = require("../src/components/session/debug_session");

describe("",function(){
    it("Public interface is defined", function(){
        expect(session.init).toBeDefined();
        expect(session.startSession).toBeDefined();
        expect(session.onStartSession).toBeDefined();
        expect(session.endSession).toBeDefined();
        expect(session.onPauseEnter).toBeDefined();
        expect(session.onPauseExit).toBeDefined();
    });

    it("Trivial", function(){
        expect(true).toEqual(true);
        console.log("bella zio");
    });
});