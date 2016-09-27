var Constants = require("../src/components/constants/constants");
var GameInfo  = require("../src/components/game_info/game_info");
var Location  = require("../src/components/location/location");
var Session   = require("../src/components/session/session");
var User      = require("../src/components/user/user");
var vhostKeys = require("../gen/vhost/vhost-keys.js");
var vHostMock = require("./mocks/vHost.js");
var UserCheckMock = require("./mocks/userCheck.js");
var GameInfoMock = require("./mocks/gameInfoMock.js");
var StargateMockClass = require("./mocks/StargateMock");
var MenuMockClass = require("./mocks/menuMock");
var NewtonAdapterMockClass = require("./mocks/newtonAdapterMock");

require('jasmine-ajax');

describe("Session",function(){

    var originalUserFetch = null, originalGameInfoFetch = null;
    var StargateMock, MenuMock;
    beforeEach(function() {
        window.fakewindow = {
            location:{
                origin:"http://www.gameasy.com", 
                hostname:"", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gameasy.com/ww-it/html5gameplay/c2701133414427fee732e051abdfe3e8/game/fruit-slicer"
            }
        };
        
        StargateMock = new StargateMockClass();
        MenuMock = new MenuMockClass();
        NewtonAdapterMock = new NewtonAdapterMockClass();
        Session.reset();
        
        Session.setMock("NewtonService", NewtonAdapterMock);
        Session.setMock("Stargate", StargateMock);
        Session.setMock("Menu", MenuMock);
        Session.setMock("VHost", {
            load:function(){return Promise.resolve(true)},
            get:function(key){
                return vHostMock[key];
            }
        });

        Session.setMock("User", {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'guest';},
            getUserId:function(){ return UserCheckMock.user; },
            canPlay:function(){ return Promise.resolve(true)}
        });
        Session.setMock("GameInfo", {
            fetch:function(){return Promise.resolve(true)},
            getContentId:function(){
                return GameInfoMock.game_info.contentId;
            },
            getInfo:function(){
                return GameInfoMock.game_info;
            }
        });
        jasmine.Ajax.install();

        // Mock Location.getCurrentHref for function GameInfo.getContentId
        Location.getCurrentHref = function(){
            return 'http://www.giochissimo.it/html5gameplay/4de756a55ac71f45c5b7b4211b71219e/game/fruit-slicer';
        };
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        Session.unsetMock("NewtonService");
        Session.unsetMock("Stargate");                
        Session.unsetMock("VHost");
        Session.unsetMock("User");
        Session.unsetMock("GameInfo");        
        Session.unsetMock("Menu");
    });
    
    it("Session: isInitialized return true after init", function(done){
        // Mocking modules into session
        var menuShow = jasmine.createSpy("menushow");
        MenuMock.show = menuShow;

        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);
        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({            
            'response': { canDownload:true },            
            'status': 200,
            'contentType': 'text/json'                    
        });

        Session.init({}).then(function(){
            expect(Session.isInitialized()).toEqual(true);
            expect(menuShow).toHaveBeenCalled();           
            done();
        });
    });

    it("Session: should be started correctly", function(done){
        // Mocking modules into session

        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);
        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({            
            'response': { canDownload:true },            
            'status': 200,
            'contentType': 'text/json'                    
        });
        
        expect(Session.getConfig().sessions).toBeDefined();
        expect(Session.getConfig().sessions.length).toEqual(0);

        Session.onStart(function(){
            expect(Session.isInitialized()).toEqual(true);            
            expect(Session.getConfig().sessions.length).toEqual(1);
            
            expect(Session.getConfig().sessions[0].startTime).toBeDefined();            
            done();
        });

        Session.init({lite: true});
        Session.start();

    });

    it("Session is started, but cannot start two times", function(done){

        Session.setMock("User", {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'premium';},
            getUserId:function(){ return UserCheckMock.user; },
            canPlay:function(){ return Promise.resolve(true)},
            getFavorites:function(){ return Promise.resolve(true)}
        });

        var onstart = jasmine.createSpy("onstart");
        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);

        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({
            'response': JSON.stringify({ canDownload:true }),            
            'status': 200,
            'contentType': 'text/json'
        });

        Session.onStart(onstart); 

        Session.init();
        Session.start();
        try{
            Session.start();
        }catch(e) {
            expect(e).toEqual(Constants.ERROR_SESSION_ALREADY_STARTED);
            done();
        }
    });

    it("Sessions are ended, but can't be ended two times", function(done){
        // Mocking canDownload url
        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);

        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({            
            'response': JSON.stringify({ canDownload:true }),            
            'status': 200,
            'contentType': 'text/json'                    
        });

        Session.init();

        Session.start();
        expect(Session.getConfig().sessions[0].endTime).toBeUndefined();
        
        Session.end({score:10});
        expect(Session.getConfig().sessions[0].endTime).toBeDefined();

        var errorEndSession;
        try {
            Session.end({score:5});
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
            errorStartSession = e;
        }
        expect(errorStartSession).toEqual(Constants.ERROR_SESSION_INIT_NOT_CALLED);
        done();
    });

    it("Session cannot be ended before init was called", function(){

        var errorEndSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_INIT_NOT_CALLED);        
    });

    it("Session cannot be ended before init", function(done){

        Session.init();

        var errorEndSession;
        try {
            Session.end({});
        } catch (e){
            errorEndSession = e;
        }

        expect(errorEndSession).toEqual(Constants.ERROR_SESSION_NO_SESSION_STARTED);
        done();
    });

    it("Session end: Score type check string throw error", function(done){
        // Mocking canDownload url
        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);

        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({            
            'response': JSON.stringify({ canDownload:true }),            
            'status': 200,
            'contentType': 'text/json'                    
        });

        Session.onStart(function(){
            done();
        });
        Session.init({});

        Session.start();
        try{
            Session.end({score: '10'});
        } catch(e){
            expect(e).toEqual(new Error(Constants.ERROR_SCORE_TYPE + typeof ''));
        }
        
    });

    it("Session end: Score type check number should be ok", function(done){
        // Mocking canDownload url
        var canDownloadMockURL = window.fakewindow.location.origin + "/ww-it" + Constants.CAN_DOWNLOAD_API_URL;
        canDownloadMockURL = canDownloadMockURL.replace(":ID", GameInfoMock.game_info.contentId);

        jasmine.Ajax.stubRequest(canDownloadMockURL).andReturn({            
            'response': JSON.stringify({ canDownload:true }),            
            'status': 200,
            'contentType': 'text/json'                    
        });

        var error;
        Session.onStart(function(){            
            expect(error).toBeUndefined();
            expect(Session.getConfig().sessions[0].score).toEqual(10);
            done();
        });

        Session.init({});
        Session.start();
        
        try{
            Session.end({score: 10});
        } catch(e){
            error = e;
        }
    });

    it("Session: onStartSession should not be called if canDownload is false", function(done){
        Session.setMock("User", {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'guest';},
            getUserId:function(){ return UserCheckMock.user; },
            canPlay:function(){ return Promise.resolve(false)}
        });

        // Mocking modules into session
        var menuShow = jasmine.createSpy("menushow");
        var menuHide = jasmine.createSpy("menuhide");
        var onstart = jasmine.createSpy("onstart2");
        MenuMock.show = menuShow;
        MenuMock.hide = menuHide;
        
        Session.init({}).then(function(){
            expect(Session.isInitialized()).toEqual(true);
            expect(menuShow).toHaveBeenCalled();
        });

        Session.onStart(onstart);
        Session.start();
        setTimeout(function(){
            expect(menuHide).toHaveBeenCalled();
            expect(onstart.calls.count()).toEqual(0);
            onstart = null;
            done();
        }, 600);        
    });

    it("Session: init lite and startSession with canDownload false as string", function(done){
        Session.setMock("User", {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'guest';},
            getUserId:function(){ return UserCheckMock.user; },
            canPlay:function(){ return Promise.resolve(false)}
        });
        // Mocking modules into session
        var menuShow = jasmine.createSpy("menushow");
        var menuHide = jasmine.createSpy("menuhide");
        var onstart = jasmine.createSpy("onstart3");
        MenuMock.show = menuShow;
        MenuMock.hide = menuHide;

        Session.init({ lite: true }).then(function(){
            expect(Session.isInitialized()).toEqual(true);
            expect(menuShow).toHaveBeenCalled();            
        });

        Session.onStart(onstart);
        Session.start();
        setTimeout(function(){
            expect(menuHide).toHaveBeenCalled();
            // In lite mode should be called
            expect(onstart).toHaveBeenCalled();
            expect(onstart.calls.count()).toEqual(1);
            onstart = null;
            done();
        }, 600);        
    });
});