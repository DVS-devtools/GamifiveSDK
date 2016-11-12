var GamifiveSDK = require("../src/builders/build");

describe("GamifiveSDK web build",function(){
    
    it("Retro interface is defined", function(){

        expect(GamifiveSDK.init).toBeDefined();
        expect(GamifiveSDK.getConfig).toBeDefined();
        expect(GamifiveSDK.startSession).toBeDefined();
        expect(GamifiveSDK.onStartSession).toBeDefined();
        expect(GamifiveSDK.endSession).toBeDefined();

        expect(GamifiveSDK.showMoreGamesButton).toBeDefined();
        expect(GamifiveSDK.hideMoreGamesButton).toBeDefined();
        expect(GamifiveSDK.share).toBeDefined();

        expect(GamifiveSDK.saveUserData).toBeDefined();
        expect(GamifiveSDK.loadUserData).toBeDefined();
        expect(GamifiveSDK.clearUserData).toBeDefined();
        
    });

    
});