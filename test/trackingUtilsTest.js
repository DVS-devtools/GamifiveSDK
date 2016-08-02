var vHostMock = require("./mocks/vHost.js");
var GameInfoMock = require("./mocks/gameInfoMock.js");
var calculateContentRanking = require("../src/components/tracking_utils/tracking_utils").calculateContentRanking;

describe('Tracking Utils test', function(){
    it("calculateContentRating user guest", function(){
        expect(calculateContentRanking).toBeDefined();
        
        var VHost = {
            load:function(){return Promise.resolve(true)},
            get:function(key){
                return vHostMock[key];
            }
        }
        
        var GameInfo = {
            fetch:function(){return Promise.resolve(true)},
            getContentId:function(){                              
                return GameInfoMock.game_info.contentId;
            }, getInfo:function(){
                return GameInfoMock.game_info;
            }
        }

        var User = {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'guest';}
        };
        
        var result = calculateContentRanking(
            GameInfo, 
            User, 
            VHost, 
            'Play', 
            'GameLoad');
        
        expect(result).toEqual({
            contentId:"c2701133414427fee732e051abdfe3e8",
            score:3,
            scope:'consumption'
        });
    });

    it("calculateContentRating test premium and free", function(){
        expect(calculateContentRanking).toBeDefined();
        
        var VHost = {
            load:function(){return Promise.resolve(true)},
            get:function(key){
                return vHostMock[key];
            }
        }
        
        var GameInfo = {
            fetch:function(){return Promise.resolve(true)},
            getContentId:function(){                              
                return GameInfoMock.game_info.contentId;
            }, getInfo:function(){
                return GameInfoMock.game_info;
            }
        }

        var User = {
            fetch:function(){return Promise.resolve(true)},
            loadData:function(){return Promise.resolve(true)},
            getUserType:function(){ return 'premium';}
        };
        
        var result = calculateContentRanking(
            GameInfo, 
            User, 
            VHost, 
            'Play', 
            'GameLoad');
        
        expect(result).toEqual({
            contentId: 'c2701133414427fee732e051abdfe3e8',
            score: 3,
            scope: 'consumption'
        });
        
        User.getUserType = function(){
            return 'free';
        }

        expect(result).toEqual({
            contentId: 'c2701133414427fee732e051abdfe3e8',
            score: 3,
            scope: 'consumption'
        });
    });

});