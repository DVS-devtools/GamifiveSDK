var VHost = require("../src/components/vhost/vhost");
var API = require("../src/components/api/api");
var Location  = require("../src/components/location/location");
var vhostKeys = require("../gen/vhost/vhost-keys.js");
var Constants = require("../src/components/constants/constants");
var vHostMock = require("./mocks/vHost.js");
var StargateMockClass = require("./mocks/StargateMock.js");

require('jasmine-ajax');

describe("VHost", function(){    
    var StargateMock;

    beforeEach(function() {
        StargateMock = new StargateMockClass();
        window.cordova = {
            file:{applicationStorageDirectory:"file:///applicationStorageDirectory/"}
        };
        window.fakewindow = {
            location:{
                origin:"http://www2.gameasy.com", 
                hostname:"", 
                port:"", 
                protocol:"", 
                href:"http://www2.gameasy.com/ww-it/#!/"
            }
        }
        
        jasmine.Ajax.install();
        // VHost.setStargateMock(StargateMock);
        
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        window.cordova = null;
        StargateMock = null;
        // VHost.unsetStargateMock();
        VHost.reset();
    });

    it('VHost url correctly get from Constants', function(done){
        VHost.setStargateMock(StargateMock);
        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        expect(request.url.indexOf(API.get('VHOST_API_URL'))).toEqual(0);
        VHost.unsetStargateMock();
        done();

    });

    it('VHost should load from API', function(done){
        VHost.setStargateMock(StargateMock);
        var url = Location.getOrigin() + '/v01/config.getvars?keys=' + vhostKeys.join(",");        
        jasmine.Ajax.stubRequest(url).andReturn({            
            'response': vHostMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });
        
        VHost.load();
        
        VHost.afterLoad(function(){
            var usercheckapi = VHost.get('MOA_API_USER_CHECK');
            expect(usercheckapi).toBeDefined();
            expect(usercheckapi.indexOf("user.check") !== -1).toEqual(true);
            VHost.unsetStargateMock();
            done();
        });       
        
    });
    
    it('VHost should load from api (hybrid and connection online)', function(done){
        var url = Location.getOrigin() + '/v01/config.getvars?keys=' + vhostKeys.join(",");        
        jasmine.Ajax.stubRequest(url).andReturn({            
            'response': vHostMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });

        
        // MOCKING STARGATE
        StargateMock.file.fileExists = function(){
            return Promise.resolve(true);
        };

        StargateMock.isHybrid = function(){            
            return true;
        }

        StargateMock.file.write = function(path, stringObject){            
            return Promise.resolve(stringObject);
        }

        StargateMock.checkConnection = function(){
            return {type: "online", networkState: "wifi"}
        }

        
        VHost.setStargateMock(StargateMock);
        VHost.load();   
        
        VHost.afterLoad(function(){
            var usercheckapi = VHost.get('MOA_API_USER_CHECK');
            expect(usercheckapi).toBeDefined();
            expect(usercheckapi.indexOf("user.check") !== -1).toEqual(true);
            VHost.unsetStargateMock();            
            done();
        });        
    });

    it('VHost should be loaded from file (hybrid and connection offline)', function(done){
        var url = Location.getOrigin() + '/v01/config.getvars?keys=' + vhostKeys.join(",");        
        jasmine.Ajax.stubRequest(url).andReturn({            
            'response': vHostMock,            
            'status': 200,
            'contentType': 'text/json'                    
        });
        
        // MOCKING STARGATE
        StargateMock.file.fileExists = function(){
            return Promise.resolve(true);
        };

        StargateMock.isHybrid = function(){            
            return true;
        }

        StargateMock.file.write = function(path, stringObject){            
            return Promise.resolve(stringObject);
        }

        StargateMock.file.readFileAsJSON = function(){
            return Promise.resolve(vHostMock);
        }

        StargateMock.checkConnection = function(){
            return {type: "offline", networkState: "none"}
        }
        
        VHost.setStargateMock(StargateMock);
        VHost.load();
        
        VHost.afterLoad(function(){
            var usercheckapi = VHost.get('MOA_API_USER_CHECK');
            expect(usercheckapi).toBeDefined();
            expect(usercheckapi.indexOf("user.check") !== -1).toEqual(true);
            VHost.unsetStargateMock();            
            done();
        });        
    });

});