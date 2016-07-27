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

describe("User",function(){    
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
        }
        StargateMock = new StargateMockClass();
        // User.setStargateMock(StargateMock);

    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        // User.unsetStargateMock();
        StargateMock = null;             
    });

    it('User.fetch should work after vhost load', function(done){
        User.setStargateMock(StargateMock);
        VHost.setStargateMock(StargateMock);   
        // stub vhost
        var vhostUrlStub = "http://www.gameasy.com/ww-it" + Constants.VHOST_API_URL;
        vhostUrlStub = vhostUrlStub + vhostKeys.join(",");
        
        console.log("VHOST stub url",vhostUrlStub);
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
        }

        VHost.load();
        VHost.afterLoad(function(){
            
            User.fetch(function(){
                for (var key in UserCheckMock){
                    expect(User.get(key)).toEqual(UserCheckMock[key]);
                }
                User.unsetStargateMock();
                VHost.unsetStargateMock();   
                done();
            });
        });
    });

    it("Check User saveData", function(done){
        User.setStargateMock(StargateMock);
        VHost.setStargateMock(StargateMock);
        
        // stub vhost
        var vhostUrlStub = "http://www.gameasy.com/ww-it" + Constants.VHOST_API_URL;
        vhostUrlStub = vhostUrlStub + vhostKeys.join(",");       
        
        // vhost url mock
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

        // stub saveUserData
        jasmine.Ajax.stubRequest(VHostMock.MOA_API_APPLICATION_OBJECTS_SET).andReturn({            
                'response': saveUserDataMock,            
                'status': 200,
                'contentType': 'text/json'                    
        });
        
        var originalLoadData = User.loadData;

        User.loadData = function(callback){
            if (typeof callback === 'function'){
                callback();   
            }
        }
        
        VHost.load();

        VHost.afterLoad(function(){
            User.fetch(function(){
                
                User.saveData({ pippo:1 });
                var userInfo = User.getInfo();
                expect(userInfo).toBeDefined();
                expect(userInfo.gameInfo).toBeDefined();
                expect(userInfo.gameInfo.info).toBeDefined();
                expect(userInfo.gameInfo.info.pippo).toEqual(1);
                User.unsetStargateMock();
                VHost.unsetStargateMock();
                done();               
            });
        });

    });
});