
var Session = require("../src/components/session/session");

require('jasmine-ajax');

describe("Session",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });
    
    it("Sessions should be defined only after initialization", function(){
        expect(Session.getConfig().sessions).toBeUndefined();

        Session.init({});

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'Session' },
            readyState: 4
        });

        expect(Session.getConfig().sessions).toBeDefined();
    });


});