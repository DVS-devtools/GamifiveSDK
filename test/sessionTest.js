var session = require("../src/components/Session");

describe("",function(){
    it("Pippo", function(){
        expect(session.init).toBeDefined();
        expect(session.startSession).toBeDefined();
        expect(session.endSession).toBeDefined();
        expect(true).toEqual(true);
    });

    it("Pluto", function(){
        expect(session.init).toBeDefined();
        expect(session.startSession).toBeDefined();
        expect(session.endSession).toBeDefined();
    });
});