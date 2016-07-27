var Constants = require("../src/components/constants/constants");
var GameInfo  = require("../src/components/game_info/game_info");
var Location  = require("../src/components/location/location");
var StargateMockClass = require("./mocks/StargateMock");

require('jasmine-ajax');

describe("GameInfo", function(){
    var StargateMock;
    beforeEach(function(){
        StargateMock = new StargateMockClass();
        jasmine.Ajax.install();
    });

    afterEach(function(){
        jasmine.Ajax.uninstall();
        window.fakewindow = null;
        GameInfo.unsetStargateMock();
    });

    it("should calculate contentId with regex from current href", function(){
        window.fakewindow = {
            location:{
                origin:"http://www2.gameasy.com", hostname:"", port:"",protocol:"", 
                href:"http://www2.gameasy.com/html5gameplay/4de756a55ac71f45c5b7b4211b71219e/game/fruit-slicer"
            }
        }

        expect(GameInfo.getContentId()).toEqual('4de756a55ac71f45c5b7b4211b71219e');
    });

    it("should raise an error if no contentId can be found", function(){
        window.fakewindow = {
            location:{
                origin:"http://www2.gameasy.com", hostname:"", port:"", protocol:"", 
                href:"http://www.anotherproduct.com/anotherpattern/4de756a55ac71f45c5b7b4211b71219e"
            }
        }   

        var error;
        try {
            GameInfo.getContentId();
        } catch (e){
            error = e;
        }
        expect(error.indexOf(Constants.ERROR_GAME_INFO_NO_CONTENTID) > -1).toEqual(true);
    });

    it("fetch should return the data", function(done){
        window.fakewindow = {
            location:{
                origin:"http://www2.gameasy.com", hostname:"", port:"", protocol:"", 
                href:"http://www2.gameasy.com/ww-it/html5gameplay/c2701133414427fee732e051abdfe3e8/game/fruit-slicer"
            }
        }

        // SET THE RESPONSE OF THE URL
        var gameInfoMock = { 
            test:"im a gameinfo object",
            game_info:{"data":1}
        };
        
        
        // SET THE URL TO FETCH
        var gameInfoUrl = "http://www2.gameasy.com/ww-it/v01/gameplay?content_id=c2701133414427fee732e051abdfe3e8"
        jasmine.Ajax.stubRequest(gameInfoUrl).andReturn({            
                'response': JSON.stringify(gameInfoMock),            
                'status': 200,
                'contentType': 'text/json'                    
        });

        GameInfo.setStargateMock(StargateMock);

        expect(GameInfo.getInfo()).toEqual({});
        GameInfo.fetch(function(info){            
            expect(info).toBeDefined();
            
            expect(GameInfo.getInfo()).toEqual(gameInfoMock.game_info);
            expect(GameInfo.getInfo()).toEqual(info);
            expect(GameInfo.get("data")).toEqual(1);
            done();
        }); 


    });

});