var VHost = require("../src/components/vhost/vhost");

require('jasmine-ajax');

describe("A description",function(){
        
    beforeEach(function() {
        jasmine.Ajax.install();
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("load is defined", function(){
        expect(VHost.load).toBeDefined();
        console.log("VHost.load is defined");
    }); 

    
    it('url should be api/vhost', function(){
        VHost.load();
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe('api/vhost');        

    });

    it('load and get should work', function(){
        VHost.afterLoad(function(){
            expect(VHost.get('test')).toEqual(1234);
        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { test: 1234 },
            readyState: 4
        });
    });

});