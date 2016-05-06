var Constants = require("../src/components/constants/constants");
var GameInfo  = require("../src/components/game_info/game_info");
var Location  = require("../src/components/location/location");

describe("GameInfo", function(){
    
    it("should calculate contentId with regex from current href", function(){
        
        expect(Location.getCurrentHref).toBeDefined();

        // Mock Location.getCurrentHref 
        Location.getCurrentHref = function(){
            return 'http://www.giochissimo.it/html5gameplay/4de756a55ac71f45c5b7b4211b71219e/game/fruit-slicer';
        }        

        expect(GameInfo.getContentId()).toEqual('4de756a55ac71f45c5b7b4211b71219e');
    });

    it("should raise an error if no contentId can be found", function(){
        
        // Mock Location.getCurrentHref 
        Location.getCurrentHref = function(){
            return 'http://www.anotherproduct.com/anotherpattern/4de756a55ac71f45c5b7b4211b71219e';
        }        

        var error;
        try {
            GameInfo.getContentId();
        } catch (e){
            error = e;
        }
        expect(error.indexOf(Constants.ERROR_GAME_INFO_NO_CONTENTID) > -1).toEqual(true);
    });

});