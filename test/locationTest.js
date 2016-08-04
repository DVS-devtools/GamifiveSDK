var Location  = require("../src/components/location/location");
var Constants = require("../src/components/constants/constants");

describe("Location test", function(){
    beforeAll(function(){
        window.fakewindow = {};
    });

    afterAll(function(){
        window.fakewindow = null;
    });

    it("Location getOrigin should work www", function(){
        window.fakewindow = {
            location:{
            origin:"http://www.gameasy.com", 
            hostname:"", port:"", protocol:"", href:"http://www.gameasy/ww-it/#!/"}
        }

        expect(Location.getOrigin()).toEqual(window.fakewindow.location.origin);
    });

    it("Location getOrigin should work with www2", function(){
        window.fakewindow = {
            location:{origin:"http://www2.gameasy.com", 
                hostname:"", 
                port:"", 
                protocol:"", 
                href:"http://www2.gameasy.com/ww-it/#!/"
            }
        }

        expect(Location.getOrigin()).toEqual(window.fakewindow.location.origin + "/ww-it");
    })

    it("Location getOrigin should work when origin undefined", function(){
        window.fakewindow = {
            location:{
                origin:null, 
                hostname:"www.gameasy.com", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gameasy.com/ww-it/#!/"
            }
        }
        var expected = window.fakewindow.location.protocol + "//" + window.fakewindow.location.hostname + "/ww-it";

        expect(Location.getOrigin()).toEqual(expected);
    });

    it("Location getOrigin should work when html5game pattern", function(){
        window.fakewindow = {
            location:{
                origin:null, 
                hostname:"www.gameasy.com", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gameasy.com/ww-it/html5gameplay/c2701133414427fee732e051abdfe3e8/game/fruit-slicer"
            }
        }
        var expected = window.fakewindow.location.protocol + "//" + window.fakewindow.location.hostname + "/ww-it";

        expect(Location.getOrigin()).toEqual(expected);
    });

    it("Location getOrigin should work when pattern is testing url", function(){
        window.fakewindow = {
            location:{
                origin:null, 
                hostname:"www.gameasy.com", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gameasy.com/test/fabiof/sdk_integration_test/c2701133414427fee732e051abdfe3e8/index.html"
            }
        }
        var expected = window.fakewindow.location.protocol + "//" + window.fakewindow.location.hostname + "/ww-it";

        expect(Location.getOrigin()).toEqual(expected);
    });

    it("Location getOrigin should work when pattern is testing url for gamifive", function(){
        window.fakewindow = {
            location:{
                origin:null, 
                hostname:"www.gamifive.it", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gamifive.it/test/fabiof/sdk_integration_test/c2701133414427fee732e051abdfe3e8/index.html"
            }
        }
        var expected = window.fakewindow.location.protocol + "//" + window.fakewindow.location.hostname;

        expect(Location.getOrigin()).toEqual(expected);
    });

    it("Location.hasKey should work", function(){
        window.fakewindow = {
            location:{
                origin:null, 
                hostname:"www.gamifive.it", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gamifive.it/test/fabiof/sdk_integration_test/c2701133414427fee732e051abdfe3e8/index.html?key=1&pippo"
            }
        }

        expect(Location.hasKey('key')).toEqual(true);
        expect(Location.hasKey('pippo')).toEqual(true);
        expect(Location.hasKey('pippa')).toEqual(false);
    });

    it("Location.getQueryString should work", function(){
        window.fakewindow = {
            location:{
                origin: null, 
                hostname:"www.gamifive.it", 
                port:"", 
                protocol:"http:", 
                href:"http://www.gamifive.it/test/fabiof/sdk_integration_test/c2701133414427fee732e051abdfe3e8/index.html?key=1&pippo"
            }
        }

        expect(Location.getQueryString('key')).toEqual({key:'1',pippo:undefined});
    });
});