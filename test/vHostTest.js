var VHost = require("../src/components/vhost/vhost");

require('jasmine-ajax');

describe("VHost",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();
        VHost.reset();
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("load should be defined", function(){
        expect(VHost.load).toBeDefined();
        console.log("VHost.load is defined");
    }); 

    it('load and get should work', function(done){

        VHost.afterLoad(function(){
            expect(VHost.get('test')).toEqual('VHost');
            done();
        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 'VHost' },
            readyState: 4
        });
    });

});