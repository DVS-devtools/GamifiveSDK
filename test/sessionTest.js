var Constants = require("../src/components/constants/constants");
var GameInfo  = require("../src/components/game_info/game_info");
var Location  = require("../src/components/location/location");
var Session   = require("../src/components/session/session");
var User      = require("../src/components/user/user");
var vHostMock = require("./mocks/vHost.js");

require('jasmine-ajax');

describe("Session",function(){ 

    var originalUserFetch = null, originalGameInfoFetch = null;

    beforeEach(function(done) {
        Session.reset();

        originalUserFetch = User.fetch;
        User.fetch = function(callback){
            console.log("Mock User.fetch");
            if (typeof callback === 'function'){
                callback();
            }
        }

        originalGameInfoFetch = GameInfo.fetch;
        GameInfo.fetch = function(callback){
            console.log("Mock GameInfo.fetch");
            if (typeof callback === 'function'){
                callback();
            }
        }

        jasmine.Ajax.install();

        // Mock Location.getCurrentHref for function GameInfo.getContentId
        Location.getCurrentHref = function(){
            return 'http://www.giochissimo.it/html5gameplay/4de756a55ac71f45c5b7b4211b71219e/game/fruit-slicer';
        };
        done();
    });

    afterEach(function(done) {

        User.fetch = originalUserFetch;
        GameInfo.fetch = originalGameInfoFetch;

        jasmine.Ajax.uninstall();
        done();
    });
    
    it("Sessions: onStart should be called after init", function(done){
        var url = Location.getOrigin() + 'v01/config.getvars?keys=';
        
        jasmine.Ajax.stubRequest(url).andReturn({            
            'response': vHostMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });

        expect(Session.getConfig().sessions).toBeUndefined();

        var initProm = Session.init({ lite: true });

        // SETTING MOCK
        var Spies = {
            onstart:function(){ console.log("ONSTART"); }
        };

        spyOn(Spies, 'onstart');

        // SET ON START CALLBACK
        Session.onStart(Spies.onstart);

        Session.start();

        expect(Spies.onstart).not.toHaveBeenCalled();
        initProm.then(function(){
            expect(Spies.onstart).toHaveBeenCalled();
            done();
        }).catch(function(reason){
            console.log("FAIL", reason);
            done();
        });
    });

    it("Sessions are started, but can't be started two times", function(done){
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
        done();
    });

    it("Sessions are ended, but can't be ended two times", function(done){
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
        done();
        
    });

    it("Session cannot be started before init", function(done){

        var errorStartSession;
        try {
            Session.start();
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_INIT_NOT_CALLED);
        done();
    });

    it("Session cannot be ended before init", function(done){

        var errorStartSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_NO_SESSION_STARTED);
        done();
    });

    it("Session cannot be ended before being started", function(done){

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
        done();
    });

    it("Score type check", function(done){

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

        done();
    });

});