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
        // User.setStargateMock(StargateMock);

    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        User.unsetMock("Stargate");
        StargateMock = null;             
    });

    it('User.fetch should work after vhost load', function(done){
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
        
        var originalLoadData = User.loadData;

        User.loadData = function(callback){
            if (typeof callback === 'function'){
                callback();   
            }
        };

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

    it("User.getUserType should return premium", function(done){
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
        User.loadData = function(cb){
            cb ? cb() : null;
        };

        User.fetch(function(){
            expect(User.getUserType()).toEqual("premium");
            done();
        });        
    });
});