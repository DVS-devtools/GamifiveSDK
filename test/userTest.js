var Constants     = require('../src/components/constants/constants');
var Location      = require("../src/components/location/location");
var User          = require("../src/components/user/user");
var UserCheckMock = require("./mocks/userCheck.js");
var VHost         = require("../src/components/vhost/vhost");
var VHostMock     = require("./mocks/vHost.js");


require('jasmine-ajax');

var originalGetCurrentHref;

describe("User",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();
        VHost.reset();
        User.reset();

        originalGetCurrentHref = Location.getCurrentHref;
        // Mock Location.getCurrentHref for function GameInfo.getContentId
        Location.getCurrentHref = function(){
            return 'http://www.giochissimo.it/html5gameplay/4de756a55ac71f45c5b7b4211b71219e/game/fruit-slicer';
        };
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        Location.getCurrentHref = originalGetCurrentHref;
    });

    it('fetch then get should work', function(done){

        var originalLoadData = User.loadData;

        User.loadData = function(callback){
            if (typeof callback === 'function'){
                callback();   
            }
        }

        VHost.afterLoad(function(){
            
            User.fetch(function(){
                for (var key in UserCheckMock){
                    expect(User.get(key)).toEqual(UserCheckMock[key]);
                }
                done();

            });

            var userCheckReq = jasmine.Ajax.requests.mostRecent();

            userCheckReq.respondWith({
                status: 200, 
                contentType: 'application/json',
                response: UserCheckMock,
                readyState: 4
            });

        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: VHostMock,
            readyState: 4
        });
    });


});