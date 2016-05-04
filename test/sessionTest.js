var Constants = require("../src/components/constants/constants");
var Session   = require("../src/components/session/session");

require('jasmine-ajax');

describe("Session",function(){    

    beforeEach(function() {
        Session.reset();
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

    it("Sessions are started, but can't be started two times", function(){
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

        expect(errorStartSession).toEqual(Constants.ERROR_SESSION_ALREADY_STARTED);
    });

    it("Sessions are ended, but can't be ended two times", function(){
        Session.init({});

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'Session' },
            readyState: 4
        });

        Session.start();
        expect(Session.getConfig().sessions[0].endTime).toBeUndefined();
        
        Session.end({});
        expect(Session.getConfig().sessions[0].endTime).toBeDefined();

        var errorEndSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_ALREADY_ENDED);
        
    });

    it("Session cannot be started before init", function(){

        var errorStartSession;
        try {
            Session.start();
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_INIT_NOT_CALLED);
    });

    it("Session cannot be ended before init", function(){

        var errorStartSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_NO_SESSION_STARTED);
    });

    it("Session cannot be ended before being started", function(){

        Session.init({});

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'Session' },
            readyState: 4
        });

        var errorEndSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_NO_SESSION_STARTED);
    });

    it("Score type check", function(){

        Session.init({});

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'Session' },
            readyState: 4
        });

        Session.start();

        Session.end({score: 10});

        // no exceptions expected

        /** CASE STRING **/

        Session.start();

        var errorEndSession;
        try {
            Session.end({score: '10'});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SCORE_TYPE + 'string');

        /** CASE BOOLEAN **/

        Session.start();

        var errorEndSession;
        try {
            Session.end({score: true});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SCORE_TYPE + 'boolean');

        /** CASE NULL **/ 

        Session.start();

        var errorEndSession;
        try {
            Session.end({score: null});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SCORE_TYPE + 'object');

    });




});