
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

    it("Sessions can't be started two times", function(){
        Session.init({});

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'Session' },
            readyState: 4
        });

        expect(typeof Session.getConfig().sessions).toEqual(typeof []);

        Session.start();

        expect(Session.getConfig().sessions.length).toEqual(1);

        var errorStartSession;
        try {
            Session.start();
        } catch (e){
            errorStartSession = e;
        }

        expect(errorStartSession).toEqual('GamifiveSDK :: Session :: start :: previous session not ended');
    });


});