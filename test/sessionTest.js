
var Session = require("../src/components/session/session");

describe("GameInfo",function(){
    
    it("Sessions should be defined only after initialization", function(){
        expect(Session.getConfig().sessions).toBeUndefined();

        Session.init({});

        expect(Session.getConfig().sessions).toBeDefined();
    });


});