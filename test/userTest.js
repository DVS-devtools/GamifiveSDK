var session = require("../src/components/user/debug_user");

describe("A description",function(){
    it("Public interface is defined", function(){
        expect(session.init).toBeDefined();
        expect(session.getConfig).toBeDefined();
        expect(session.startSession).toBeDefined();
        expect(session.onStartSession).toBeDefined();
        expect(session.endSession).toBeDefined();
        expect(session.onPauseEnter).toBeDefined();
        expect(session.onPauseExit).toBeDefined();
    });

    it("Trivial", function(){
        expect(true).toEqual(true);
    });
});