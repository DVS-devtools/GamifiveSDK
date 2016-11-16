var Constants     = require('../src/components/constants/constants');
var User          = require("../src/components/user/user");
var UserCheckMock = require("./mocks/userCheck.js");
var VHost         = require("../src/components/vhost/vhost");
var VHostMock     = require("./mocks/vHost.js");
var StargateMockClass = require("./mocks/StargateMock");
var vhostKeys = require("../gen/vhost/vhost-keys.js");
var saveUserDataMock = require('./mocks/saveUserDataMock'); 

require('jasmine-ajax');

var originalGetCurrentHref;

describe("User", function(){
    var StargateMock;

    beforeEach(function() {
        jasmine.Ajax.install();
        VHost.reset();
        User.reset();
        window.fakewindow = {
            location:{origin:"http://www.gameasy.com", 
                hostname:"", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gameasy.com/ww-it/html5gameplay/c2701133414427fee732e051abdfe3e8/game/fruit-slicer"
            }
        };
        StargateMock = new StargateMockClass();
        User.setMock("Stargate", StargateMock);

    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        User.unsetMock("Stargate");
        StargateMock = null;             
    });

    xit('User.fetch should work after vhost load', function(done){
        User.setMock("Stargate", StargateMock);
        VHost.setMock("Stargate", StargateMock);
        // stub vhost
        var vhostUrlStub = "http://www.gameasy.com/ww-it" + Constants.VHOST_API_URL;
        vhostUrlStub = vhostUrlStub + vhostKeys.join(",");

        jasmine.Ajax.stubRequest(vhostUrlStub).andReturn({            
            'response': VHostMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });

        // stub user.check
        jasmine.Ajax.stubRequest(VHostMock.MOA_API_USER_CHECK).andReturn({            
            'response': UserCheckMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });

        VHost.load();
        VHost.afterLoad(function(){            
            User.fetch(function(){
                for (var key in UserCheckMock){
                    expect(User.get(key)).toEqual(UserCheckMock[key]);
                }
                User.unsetMock("Stargate");
                VHost.unsetMock("Stargate");   
                done();
            });
        });
    });

    it("User.getUserType should return guest with no userInfo", function(){
        expect(User.getUserType()).toEqual('guest');
    });

    xit("User.getUserType should return premium", function(done){
        // stub user.check
        jasmine.Ajax.stubRequest(VHostMock.MOA_API_USER_CHECK).andReturn({            
            'response': UserCheckMock,
            'status': 200,
            'contentType': 'text/json'
        });
        
        User.setMock("VHost", {
            get:function(key){
                return VHostMock[key];
            }
        });

        User.setMock("Stargate", StargateMock);

        User.fetch(function(){
            expect(User.getUserType()).toEqual("premium");
            done();
        });        
    });
    
    it("Internal syncData function: serverGameInfo should win if not localGameInfo", function(){
        var serverGameInfo = {        
            CreatedAt: String(new Date(0)),
            UpdatedAt: String(new Date()),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null            
        };
        var result = User.syncUserData([null, serverGameInfo]);
        expect(result).toEqual(serverGameInfo);

    });

    it("Internal syncData function: localGameInfo should win if not serverGameInfo", function(){
        var localGameInfo = {
                CreatedAt: String(new Date(0)),
                UpdatedAt: String(new Date()),
                ProductId: "",
                contentId: "",
                domain: "",
                Creator: "",
                _id: "",
                info:null
        };
        var result = User.syncUserData([localGameInfo, null]);
        expect(result).toEqual(localGameInfo);

    });
    
    it("Internal syncData function: should win most updated: serverGameInfo", function(){
        var localDate = new Date();
        var localGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: localDate.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null
        };

        var mostUpdated = new Date();
        mostUpdated.setDate(32);
        var serverGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: mostUpdated.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null            
        };
        var result = User.syncUserData([localGameInfo, serverGameInfo]);
        expect(result).toEqual(serverGameInfo);

    });

    it("Internal syncData function: should win most updated:local", function(){
        var localDate = new Date();
        localDate.setDate(33);
        var localGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: localDate.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null
        };

        var mostUpdated = new Date();
        var serverGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: mostUpdated.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null            
        };
        var result = User.syncUserData([localGameInfo, serverGameInfo]);
        expect(result).toEqual(localGameInfo);

    });


    it("Internal syncData function: limit case. same timestamp", function(){
        var localDate = new Date();
        
        var localGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: localDate.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null
        };

        var serverGameInfo = {            
            CreatedAt: "2016-11-08T17:11:23.187Z",
            UpdatedAt: localDate.toISOString(),
            ProductId: "",
            contentId: "",
            domain: "",
            Creator: "",
            _id: "",
            info:null            
        };
        var result = User.syncUserData([localGameInfo, serverGameInfo]);
        expect(result).toBeUndefined();

    });
});