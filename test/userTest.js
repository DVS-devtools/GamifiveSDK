var Constants     = require('../src/components/constants/constants');
var User          = require("../src/components/user/user");
var UserCheckMock = require("./mocks/userCheck.js");
var VHost         = require("../src/components/vhost/vhost");

require('jasmine-ajax');

describe("User",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();
        VHost.reset();
        User.reset();
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it('fetch then get should work', function(done){

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
            response: { 
                'MOA_API_USER_CHECK': 'userCheckMockUrl',
                'MOA_API_APPLICATION_OBJECTS_GET': 'loadUserDataMockUrl',
                'MOA_API_APPLICATION_OBJECTS_SET': 'saveUserDataMockUrl'
            },
            readyState: 4
        });
    });

    it('get before fetch raises exception', function(){
        var error;
        try {
            User.get('user');
        } catch (e){
            error = e;
        }

        expect(error).toEqual(Constants.ERROR_USER_GET_BEFORE_FETCH);
    });

});